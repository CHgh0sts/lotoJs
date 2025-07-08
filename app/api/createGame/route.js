import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {

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
      userId: 1,
      roleId: 1,
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
}
