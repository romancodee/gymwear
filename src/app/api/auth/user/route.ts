import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbconnect';
import User from '../../../model/User';
import { getUserDate } from '../../../../helper/getUserData';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  console.log('🔄 Connecting to DB...');
  await dbConnect();

  const cookieStore =await cookies();
  const token = cookieStore.get('token')?.value;

  console.log('🔐 Token:', token);

  if (!token) {
    console.log('❌ No token provided');
    return NextResponse.json(
      { success: false, error: 'No token provided' },
      { status: 401 }
    );
  }

  const decoded = getUserDate(token); // might return string or object
  console.log('🧾 Decoded Token:', decoded);

  const userId = typeof decoded === 'string' ? decoded : decoded?.id;

  if (!userId) {
    console.log('❌ Invalid token (no user ID)');
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const user = await User.findById(userId).select('_id');
  console.log('👤 User:', user);

  if (!user) {
    console.log('❌ User not found');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ userId: user._id.toString() });
}
