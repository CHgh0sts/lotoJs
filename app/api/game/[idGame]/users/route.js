import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req, context) {
  try {
    const params = await context.params; 
    const idGame = params.idGame;

    if (!idGame) {
      return NextResponse.json({ error: 'idGame is required' }, { status: 400 });
    }

    // Récupérer les infos de la partie
    const userGame = await prisma.userGame.findFirst({
      where: { userGameId: idGame },
      include: {
        game: true
      }
    });

    if (!userGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Récupérer tous les utilisateurs qui participent à cette partie
    const gameUsers = await prisma.userGame.findMany({
      where: { 
        gameId: userGame.game.id 
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            nom: true,
            prenom: true,
            username: true,
            email: true,
            isTemporary: true
            // Ne pas inclure le password
          }
        },
        role: true
      }
    });

    console.log('Found gameUsers:', JSON.stringify(gameUsers, null, 2));

    // Extraire uniquement les données utilisateur et filtrer les valeurs nulles
    const users = gameUsers
      .map(gameUser => {
        console.log('Processing gameUser:', gameUser.id, 'user:', gameUser.user);
        return gameUser.user;
      })
      .filter(user => {
        const isValid = user !== null && user !== undefined && user.id;
        console.log('User valid?', isValid, user);
        return isValid;
      });

    console.log('Final users array:', users);

    // S'assurer qu'on retourne toujours un tableau valide
    const safeUsers = Array.isArray(users) ? users : [];
    
    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 