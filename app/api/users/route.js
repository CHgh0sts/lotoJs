import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const generateNumber = (longueur) => {
    const caracteres = '0123456789';
    return Array.from({ length: longueur }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
};

export async function GET() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            userId: true,
            nom: true,
            prenom: true,
            username: true,
            email: true,
            isTemporary: true
            // Ne pas inclure le password dans les réponses
        }
    });
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
    const { nom, prenom, email, password } = await request.json();
    
    // Si email et password sont fournis, c'est une création complète d'utilisateur
    if (email && password) {
        if (!nom || !prenom || !email || !password) {
            return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 });
        }

        const userId = generateNumber(10);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: { 
                userId: userId,
                nom,
                prenom,
                email,
                password: hashedPassword,
                username: `${nom.toLowerCase()} ${prenom.toLowerCase()}`
            }
        });

        // Retourner l'utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } 
    // Sinon, création simple pour compatibilité (utilisateurs de jeu temporaires)
    else {
        if (!nom || !prenom) {
            return NextResponse.json({ error: 'Nom and prenom are required' }, { status: 400 });
        }
        
        const userId = generateNumber(10);
        const tempEmail = `${nom.toLowerCase()}.${prenom.toLowerCase()}.${userId}@temp.local`;
        const tempPassword = await bcrypt.hash('temppassword123', 10);
        
        const user = await prisma.user.create({
            data: { 
                userId: userId,
                nom,
                prenom,
                email: tempEmail,
                password: tempPassword,
                username: `${nom.toLowerCase()} ${prenom.toLowerCase()}`,
                isTemporary: true
            }
        });

        // Retourner l'utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    }
}