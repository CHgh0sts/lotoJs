import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

const generateNumber = (longueur) => {
    const caracteres = '0123456789';
    return Array.from({ length: longueur }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
};

export async function GET() {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
}

export async function DELETE(request) {
    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    // Supprimer d'abord les références dans UserGame
    await prisma.userGame.deleteMany({
        where: { userId: id }
    });
    
    // Supprimer ensuite les cartons
    const cartons = await prisma.carton.deleteMany({
        where: { userId: id }
    });
    
    // Enfin, supprimer l'utilisateur
    const user = await prisma.user.deleteMany({
        where: { id: id }
    });
    
    return NextResponse.json(user, { status: 200 });
}

export async function POST(request) {
    const { nom, prenom } = await request.json();
    if (!nom || !prenom) {
        return NextResponse.json({ error: 'Nom and prenom are required' }, { status: 400 });
    }
    const userId = generateNumber(10);
    const user = await prisma.user.create({
        data: { 
            userId: userId,
            nom,
            prenom,
            username: `${nom.toLowerCase()} ${prenom.toLowerCase()}`
        }
    });
    return NextResponse.json(user, { status: 201 });
}