import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { connectDB, sequelize } from '@/config/database';
const { Order, Student, WalletTransaction } = require('@/models');

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'orders')) return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });

    const { id } = await params;
    const { status, cancelReason } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findByPk(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If order is being cancelled by staff/admin and was not already cancelled:
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const refundAmount = parseFloat(order.total_amount);
      let newBalance = 0;

      await sequelize.transaction(async (t: any) => {
        const student = await Student.findByPk(order.student_id, { lock: true, transaction: t });

        if (student) {
          newBalance = parseFloat(student.wallet_balance || 0) + refundAmount;
          await student.update({ wallet_balance: newBalance }, { transaction: t });

          await WalletTransaction.create(
            {
              student_id: order.student_id,
              type: 'credit',
              amount: refundAmount,
              balance_after: newBalance,
              ref_id: String(order.id),
              description: `Refund: Order #${order.id} cancelled by canteen staff`,
            },
            { transaction: t }
          );
        }

        order.status = 'cancelled';
        order.cancelled_at = new Date();
        order.cancel_reason = cancelReason || 'Cancelled by canteen staff / admin';
        await order.save({ transaction: t });
      });

      console.log(`[Order Cancelled] Order #${order.id} cancelled by ${session.name || 'Staff'}. Refunded ₹${refundAmount} to student #${order.student_id}.`);
      return NextResponse.json({
        success: true,
        order,
        refunded: true,
        refundAmount,
        newBalance,
        message: `Order #${order.id} cancelled successfully and ₹${refundAmount} has been refunded to the student's wallet.`,
      });
    }

    // Regular status transition (pending -> confirmed -> ready -> delivered)
    order.status = status;
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('[/api/orders/[id] PATCH] Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
