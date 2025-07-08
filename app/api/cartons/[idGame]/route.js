import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { idGame } = await params;
    const userGame = await prisma.userGame.findFirst({
      where: {
        userGameId: idGame
      },
      include: {
        game: true
      }
    });
    if (!userGame) {
      return NextResponse.json({ error: 'User game not found' }, { status: 404 });
    }
    
    // Récupérer tous les cartons avec leurs groupes
    const allCartons = await prisma.carton.findMany({
      where: {
        gameId: userGame.game.id
      },
      include: {
        user: true,
        group: true
      }
    });
    
    // Filtrer les cartons selon le statut actif des groupes
    const activeCartons = allCartons.filter(carton => {
      // Si le carton n'a pas de groupe, il est toujours actif
      if (!carton.group) return true;
      // Si le carton a un groupe, vérifier que le groupe est actif
      return carton.group.active;
    });
    
    return NextResponse.json({
      allCartons: allCartons,
      activeCartons: activeCartons
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
