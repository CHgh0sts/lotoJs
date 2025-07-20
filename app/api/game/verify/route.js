import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { gameId } = await request.json();
    
    if (!gameId) {
      return NextResponse.json({ exists: false, error: 'Game ID manquant' }, { status: 400 });
    }

    // Vérifier si la game existe dans la base de données
    const game = await prisma.game.findFirst({
      where: {
        gameId: gameId
      }
    });

    return NextResponse.json({ 
      exists: !!game,
      gameId: gameId 
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de la game:', error);
    return NextResponse.json({ 
      exists: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
} 