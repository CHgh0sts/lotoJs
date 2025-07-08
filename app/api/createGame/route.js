import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Vérifier la session utilisateur
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);

    const gameId = Math.floor(Math.random() * 1000000);
    const userGameId = Math.floor(Math.random() * 100000);

    const game = await prisma.game.create({
      data: {
        gameId: gameId.toString(),
        createdAt: new Date(),
      },
    });

    const userGame = await prisma.userGame.create({
      data: {
        userGameId: userGameId.toString(),
        gameId: game.id,
        userId: sessionData.userId, // Utiliser l'ID de l'utilisateur connecté
        roleId: 1, // Admin par défaut
        createdAt: new Date(),
      },
    });

    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const partyId = Array.from({ length: 10 }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
    
    const party = await prisma.party.create({
      data: {
        partyId: partyId.toString(),
        Game: {
          connect: {
            id: game.id
          }
        },
        typeParty: {
          connect: {
            id: 1
          }
        },
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ gameId: userGameId });
  } catch (error) {
    console.error('Erreur lors de la création du jeu:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
