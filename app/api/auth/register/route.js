import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const generateNumber = (longueur) => {
    const caracteres = '0123456789';
    return Array.from({ length: longueur }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
};

export async function POST(request) {
  try {
    const { nom, prenom, email, password } = await request.json();

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

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userId = generateNumber(10);
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
    
    return NextResponse.json({ 
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 