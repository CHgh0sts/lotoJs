import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateNumber = (longueur) => {
    const caracteres = '0123456789';
    return Array.from({ length: longueur }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
};

export async function POST(request) {
    const { ListNumber, userId, gameId } = await request.json();
    console.log(ListNumber, userId, gameId);
    const cartonId = generateNumber(10);
    const game = await prisma.game.findFirst({
        where: {
            gameId: gameId
        }
    });
    if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    const carton = await prisma.carton.create({
        data: {
            listNumber: ListNumber,
            userId: userId,
            cartonId: cartonId,
            gameId: game.id
        },
        include: {
            game: true,
            user: true
        }
    });    
    return NextResponse.json({ carton }, { status: 201 });
}

export async function DELETE(request) {
    const { id } = await request.json();
    const carton = await prisma.carton.delete({
        where: { id: id }
    });
    return NextResponse.json({ carton }, { status: 200 });
}