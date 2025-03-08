import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function PUT(request) {
    try {
        const { partyId, typePartyId } = await request.json();
        if (!partyId || !typePartyId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const updatedParty = await prisma.party.update({
            where: { id: partyId },
            data: { typePartyId: typePartyId }
        });
        return NextResponse.json({ party: updatedParty }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}