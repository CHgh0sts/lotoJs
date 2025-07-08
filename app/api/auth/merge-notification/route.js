import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { gameIds, oldUserId, newUserId } = await request.json();
    
    // Ici on pourrait déclencher des notifications via socket
    // Pour l'instant, on retourne juste un succès
    // L'émission socket sera faite côté client après connexion réussie
    
    return NextResponse.json({ 
      message: 'Fusion notifiée',
      gameIds,
      oldUserId,
      newUserId 
    });
  } catch (error) {
    console.error('Erreur notification fusion:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 