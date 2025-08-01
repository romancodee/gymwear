import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore =await  cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return Response.json(
        { isLoggedIn: false, message: 'Token not found' },
        { status: 200 }
      );
    }

    return Response.json(
      { isLoggedIn: true, message: 'Token found' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking token:', error);
    return Response.json(
      { isLoggedIn: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
