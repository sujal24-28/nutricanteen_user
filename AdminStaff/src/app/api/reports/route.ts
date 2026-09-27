import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, sequelize } from '@/config/database';
const { Order, Student } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // 1. Delivery & Sales Stats (Today, Monthly, All Time)
    const [deliveryRows]: any = await sequelize.query(`
      SELECT
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) AS today_deliveries,
        COUNT(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) AND MONTH(created_at) = MONTH(CURRENT_DATE) THEN 1 END) AS monthly_deliveries,
        COUNT(*) AS total_deliveries,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END), 0) AS today_revenue,
        COALESCE(SUM(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) AND MONTH(created_at) = MONTH(CURRENT_DATE) THEN total_amount ELSE 0 END), 0) AS monthly_revenue,
        COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM orders
      WHERE status = 'delivered'
    `);
    const delivery = deliveryRows[0] || {};

    // 2. Wallet Recharge Stats (Today, Monthly, All Time)
    const [rechargeRows]: any = await sequelize.query(`
      SELECT
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0) AS today_recharge,
        COALESCE(SUM(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) AND MONTH(created_at) = MONTH(CURRENT_DATE) THEN amount ELSE 0 END), 0) AS monthly_recharge,
        COALESCE(SUM(amount), 0) AS total_recharge
      FROM wallet_transactions
      WHERE type = 'credit'
    `);
    const recharge = rechargeRows[0] || {};

    // 3. Students Registration Stats (Today, Monthly, Yearly, Total)
    const [studentRows]: any = await sequelize.query(`
      SELECT
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) AS today_students,
        COUNT(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) AND MONTH(created_at) = MONTH(CURRENT_DATE) THEN 1 END) AS monthly_students,
        COUNT(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) THEN 1 END) AS yearly_students,
        COUNT(*) AS total_students
      FROM students
      WHERE deleted_at IS NULL
    `);
    const student = studentRows[0] || {};

    // 3b. Schools Registration Stats (Today, Monthly, Yearly, Total)
    const [schoolRows]: any = await sequelize.query(`
      SELECT
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) AS today_schools,
        COUNT(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) AND MONTH(created_at) = MONTH(CURRENT_DATE) THEN 1 END) AS monthly_schools,
        COUNT(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) THEN 1 END) AS yearly_schools,
        COUNT(*) AS total_schools
      FROM schools
    `);
    const school = schoolRows[0] || {};

    // 4. Product Item Helper for Timeframes (Daily, Monthly, Yearly, All-Time)
    async function getItemsStats(condition: string) {
      const [items]: any = await sequelize.query(`
        SELECT 
          m.id,
          m.name,
          m.category,
          m.price,
          m.image_url,
          COALESCE(SUM(matched.quantity), 0) AS total_quantity,
          COALESCE(SUM(matched.quantity * matched.unit_price), 0) AS total_sales
        FROM menu_items m
        LEFT JOIN (
          SELECT oi.item_id, oi.quantity, oi.unit_price
          FROM order_items oi
          INNER JOIN orders o ON oi.order_id = o.id
          WHERE o.status != 'cancelled' AND ${condition}
        ) matched ON m.id = matched.item_id
        WHERE m.deleted_at IS NULL
        GROUP BY m.id
        ORDER BY total_quantity DESC, total_sales DESC, m.name ASC
      `);

      const list = items || [];
      const orderedList = list.filter((i: any) => Number(i.total_quantity) > 0);
      const mostOrdered = orderedList.length > 0 ? orderedList[0] : null;
      const leastOrdered = orderedList.length > 1
        ? orderedList[orderedList.length - 1]
        : (orderedList.length === 1 && list.length > 1 ? list[list.length - 1] : null);

      return {
        mostOrdered,
        leastOrdered,
        all: list
      };
    }

    // 4b. Business Growth & Revenue Chart Trends (Last 7 Days, Last 30 Days, Monthly This Year)
    const [
      [dailyItems, monthlyItems, yearlyItems, allTimeItems],
      [dailyOrderRows],
      [dailyRechargeRows],
      [dailyStudentRows],
      [[curDateRow]],
      [monthlyOrderRows],
      [monthlyRechargeRows],
      [monthlyStudentRows]
    ]: any = await Promise.all([
      Promise.all([
        getItemsStats('DATE(o.created_at) = CURRENT_DATE'),
        getItemsStats('YEAR(o.created_at) = YEAR(CURRENT_DATE) AND MONTH(o.created_at) = MONTH(CURRENT_DATE)'),
        getItemsStats('YEAR(o.created_at) = YEAR(CURRENT_DATE)'),
        getItemsStats('1=1')
      ]),
      sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
          COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
      `),
      sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(amount), 0) as recharge
        FROM wallet_transactions
        WHERE type = 'credit' AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
      `),
      sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_students
        FROM students
        WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
      `),
      sequelize.query(`SELECT CURRENT_DATE as curdate`),
      sequelize.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as ym,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
          COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as revenue
        FROM orders
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      `),
      sequelize.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as ym,
          COALESCE(SUM(amount), 0) as recharge
        FROM wallet_transactions
        WHERE type = 'credit' AND YEAR(created_at) = YEAR(CURRENT_DATE)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      `),
      sequelize.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as ym,
          COUNT(*) as new_students
        FROM students
        WHERE deleted_at IS NULL AND YEAR(created_at) = YEAR(CURRENT_DATE)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      `)
    ]);

    const [curY, curM, curD] = (curDateRow?.curdate || '').split('-').map(Number);

    const dailyOrderMap: Record<string, { total_orders: number; delivered_orders: number; revenue: number }> = {};
    (dailyOrderRows || []).forEach((r: any) => {
      dailyOrderMap[r.date] = {
        total_orders: Number(r.total_orders || 0),
        delivered_orders: Number(r.delivered_orders || 0),
        revenue: Number(r.revenue || 0)
      };
    });

    const dailyRechargeMap: Record<string, number> = {};
    (dailyRechargeRows || []).forEach((r: any) => {
      dailyRechargeMap[r.date] = Number(r.recharge || 0);
    });

    const dailyStudentMap: Record<string, number> = {};
    (dailyStudentRows || []).forEach((r: any) => {
      dailyStudentMap[r.date] = Number(r.new_students || 0);
    });

    // Build Last 7 Days
    const last7Days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(curY, curM - 1, curD - i);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yStr}-${mStr}-${dStr}`;
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const ord = dailyOrderMap[dateStr] || { total_orders: 0, delivered_orders: 0, revenue: 0 };
      last7Days.push({
        date: dateStr,
        label,
        revenue: ord.revenue,
        recharge: dailyRechargeMap[dateStr] || 0,
        orders: ord.total_orders,
        deliveredOrders: ord.delivered_orders,
        newStudents: dailyStudentMap[dateStr] || 0
      });
    }

    // Build Last 30 Days
    const last30Days: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(curY, curM - 1, curD - i);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yStr}-${mStr}-${dStr}`;
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const ord = dailyOrderMap[dateStr] || { total_orders: 0, delivered_orders: 0, revenue: 0 };
      last30Days.push({
        date: dateStr,
        label,
        revenue: ord.revenue,
        recharge: dailyRechargeMap[dateStr] || 0,
        orders: ord.total_orders,
        deliveredOrders: ord.delivered_orders,
        newStudents: dailyStudentMap[dateStr] || 0
      });
    }

    // Monthly This Year (12 months)
    const monthlyOrders: Record<string, { orders: number; deliveredOrders: number; revenue: number }> = {};
    (monthlyOrderRows || []).forEach((r: any) => {
      monthlyOrders[r.ym] = {
        orders: Number(r.total_orders || 0),
        deliveredOrders: Number(r.delivered_orders || 0),
        revenue: Number(r.revenue || 0)
      };
    });

    const monthlyRecharges: Record<string, number> = {};
    (monthlyRechargeRows || []).forEach((r: any) => {
      monthlyRecharges[r.ym] = Number(r.recharge || 0);
    });

    const monthlyStudents: Record<string, number> = {};
    (monthlyStudentRows || []).forEach((r: any) => {
      monthlyStudents[r.ym] = Number(r.new_students || 0);
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, '0');
      const ym = `${curY}-${mStr}`;
      const ord = monthlyOrders[ym] || { orders: 0, deliveredOrders: 0, revenue: 0 };
      monthlyData.push({
        month: ym,
        label: monthNames[m - 1],
        revenue: ord.revenue,
        recharge: monthlyRecharges[ym] || 0,
        orders: ord.orders,
        deliveredOrders: ord.deliveredOrders,
        newStudents: monthlyStudents[ym] || 0
      });
    }

    // 5. Active Queue Breakdown
    const activeOrders = await Order.findAll({
      where: { status: ['pending', 'confirmed', 'ready'] }
    });
    const pendingCount = activeOrders.filter((o: any) => o.status === 'pending').length;
    const preparingCount = activeOrders.filter((o: any) => o.status === 'confirmed').length;
    const readyCount = activeOrders.filter((o: any) => o.status === 'ready').length;

    // 6. Recent Delivered Orders
    const recentOrders = await Order.findAll({
      where: { status: 'delivered' },
      include: [
        { model: Student, as: 'student', attributes: ['name', 'class', 'section', 'roll'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 8
    });

    return NextResponse.json({
      deliveries: {
        today: Number(delivery.today_deliveries || 0),
        monthly: Number(delivery.monthly_deliveries || 0),
        total: Number(delivery.total_deliveries || 0),
        todayRevenue: Number(delivery.today_revenue || 0),
        monthlyRevenue: Number(delivery.monthly_revenue || 0),
        totalRevenue: Number(delivery.total_revenue || 0)
      },
      recharges: {
        today: Number(recharge.today_recharge || 0),
        monthly: Number(recharge.monthly_recharge || 0),
        total: Number(recharge.total_recharge || 0)
      },
      students: {
        today: Number(student.today_students || 0),
        monthly: Number(student.monthly_students || 0),
        yearly: Number(student.yearly_students || 0),
        total: Number(student.total_students || 0)
      },
      schools: {
        today: Number(school.today_schools || 0),
        monthly: Number(school.monthly_schools || 0),
        yearly: Number(school.yearly_schools || 0),
        total: Number(school.total_schools || 0)
      },
      items: {
        daily: dailyItems,
        monthly: monthlyItems,
        yearly: yearlyItems,
        allTime: allTimeItems
      },
      charts: {
        last7Days,
        last30Days,
        monthly: monthlyData
      },
      queue: {
        totalActive: activeOrders.length,
        pending: pendingCount,
        preparing: preparingCount,
        ready: readyCount
      },
      recentOrders
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[/api/reports] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
