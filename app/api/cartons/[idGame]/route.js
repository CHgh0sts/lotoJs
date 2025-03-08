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
    const cartons = await prisma.carton.findMany({
      where: {
        gameId: userGame.game.id
      }
    });
    return NextResponse.json(cartons);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
