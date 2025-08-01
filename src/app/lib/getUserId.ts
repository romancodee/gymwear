// lib/getUserId.ts

export const getUserId = async (): Promise<string | null> => {
  try {
    const res = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include', // Ensures cookies (like JWT) are sent
    });

    if (!res.ok) return null;

    const data = await res.json();

    // ✅ Store in localStorage safely
    if (typeof window !== 'undefined' && data?.userId) {
      localStorage.setItem('userId', data.userId);
    }

    return data.userId;
  } catch (err) {
    console.error('Failed to fetch user ID:', err);
    return null;
  }
};
