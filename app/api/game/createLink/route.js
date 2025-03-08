import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateNumber = (longueur) => {
    const caracteres = '0123456789';
    return Array.from({ length: longueur }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
};
export async function POST(req) {
  try {
    const { userId, gameId, roleId } = await req.json();
    const userGameId = generateNumber(6);
    const game = await prisma.game.findFirst({
      where: { gameId },
    });
    const newUserGame = await prisma.userGame.create({
      data: {
        userId: parseInt(userId),
        gameId: game.id,
        roleId: parseInt(roleId),
        userGameId,
      },
    });
    return NextResponse.json({ message: 'Link created', newUserGame }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}