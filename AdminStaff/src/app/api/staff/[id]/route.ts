import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
import bcrypt from 'bcryptjs';
const { Admin } = require('@/models');

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await req.json();

    await connectDB();
    const staff = await Admin.findByPk(id);
    if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Prevent superadmin from being modified by regular admin
    if (staff.role === 'superadmin' && session.role !== 'superadmin' && session.id !== staff.id) {
        return NextResponse.json({ error: 'Unauthorized to modify superadmin' }, { status: 403 });
    }

    if (data.password) {
        data.password_hash = await bcrypt.hash(data.password, 10);
        delete data.password;
    }

    await staff.update(data);
    return NextResponse.json({ success: true, staff });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    await connectDB();
    const staff = await Admin.findByPk(id);
    if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Prevent deleting superadmins or yourself
    if (staff.role === 'superadmin' && session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized to delete superadmin' }, { status: 403 });
    }
    if (staff.id === session.id) {
        return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await staff.destroy(); // Hard delete
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
