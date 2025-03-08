import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genererChaineAleatoire = (longueur) => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: longueur }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
};
export async function POST(request) {
    try {
        const { party, gameId } = await request.json();
        const getParty = await prisma.party.findFirst({
            where: {
                id: parseInt(party)
            }
        });
        let nextTypePartyId = parseInt(getParty.typePartyId) + 1;
        if (nextTypePartyId > 3) nextTypePartyId = 1;
        const newPartyId = genererChaineAleatoire(10);
        const game = await prisma.game.findFirst({
            where: { gameId: gameId }
        });
        if (!game) {
            return NextResponse.json({ message: 'Game not found' }, { status: 404 });
        }
        const newParty = await prisma.party.create({
            data: {
                gameId: game.id,
                typePartyId: nextTypePartyId,
                partyId: newPartyId
            }
        });
        return NextResponse.json({ message: 'New party created', newParty: newParty }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
    }
}