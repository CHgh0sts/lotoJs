import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    return NextResponse.json({ 
      user: sessionData,
      authenticated: true
    });

  } catch (error) {
    console.error('Erreur de session:', error);
    return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
  }
} 