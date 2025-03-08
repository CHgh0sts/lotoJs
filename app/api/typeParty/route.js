import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(req, context) {
    const typeParty = await prisma.typeParty.findMany();
    return NextResponse.json(typeParty);
}