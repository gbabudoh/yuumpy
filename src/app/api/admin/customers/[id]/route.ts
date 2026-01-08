import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customers = await query(
      'SELECT id, email, first_name, last_name, phone, is_active, email_verified, created_at, updated_at FROM customers WHERE id = ?',
      [id]
    ) as any[];

    if (customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer: customers[0] });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_active, email_verified, first_name, last_name, phone } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    if (email_verified !== undefined) {
      updates.push('email_verified = ?');
      values.push(email_verified);
    }
    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    await query(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete related data first (addresses, wishlist, etc.)
    await query('DELETE FROM customer_addresses WHERE customer_id = ?', [id]);
    await query('DELETE FROM wishlist WHERE customer_id = ?', [id]);
    
    // Delete the customer
    await query('DELETE FROM customers WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
