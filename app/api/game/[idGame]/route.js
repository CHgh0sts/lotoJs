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

    const infoGame = await prisma.userGame.findFirst({
      where: { userGameId: idGame }, // Assurez-vous que idGame est bien une chaîne de caractères
      include: {
        user: true,
        game: true,
        role: true
      }
    });

    if (!infoGame) {
      return NextResponse.json({ error: 'GameParamAccess not found' }, { status: 404 });
    }

    if (!infoGame.game) {
      return NextResponse.json({ error: 'Game data not found in UserGame' }, { status: 404 });
    }

    let game = await prisma.game.findFirst({
      where: { gameId: infoGame.game.gameId },
      include: {
        Party: true,
        User: true,
        UserGame: true
      }
    });

    if (!game) {
      game = await prisma.game.create({
        data: { gameId: infoGame.Game.gameId }
      });
      return NextResponse.json({ game, user: infoGame.user }, { status: 201 });
    }

    return NextResponse.json({ game, user: infoGame.user }, { status: 200 });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
