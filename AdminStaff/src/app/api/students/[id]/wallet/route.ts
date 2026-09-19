import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Student, WalletTransaction } = require('@/models');

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { amount, type, description } = await req.json(); // type: 'refund' (add) or 'deduct' (sub)

    await connectDB();
    const student = await Student.findByPk(id);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    if (type === 'deduct' && student.wallet_balance < amt) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Update balance
    if (type === 'refund') {
      student.wallet_balance = parseFloat(student.wallet_balance) + amt;
    } else {
      student.wallet_balance = parseFloat(student.wallet_balance) - amt;
    }
    
    await student.save();

    // Create transaction log
    await WalletTransaction.create({
      student_id: student.id,
      amount: type === 'refund' ? amt : amt, // The model just takes the raw amount, credit/debit distinguishes it
      type: type === 'refund' ? 'credit' : 'debit',
      balance_after: student.wallet_balance,
      description: `MANUAL_${Date.now()}`,
    });

    return NextResponse.json({ success: true, balance: student.wallet_balance });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
