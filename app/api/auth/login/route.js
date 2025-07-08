import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 });
    }

    // Vérifier le mot de passe (pour les anciens utilisateurs avec mot de passe en clair)
    let isValidPassword = false;
    if (user.password.startsWith('$2b$')) {
      // Mot de passe hashé
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Mot de passe en clair (migration)
      isValidPassword = password === user.password;
      // Hasher le mot de passe pour la prochaine fois
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      }
    }

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Créer une session (simple avec cookie)
    const sessionData = {
      userId: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom
    };

    const response = NextResponse.json({ 
      message: 'Connexion réussie',
      user: sessionData
    });

    // Définir le cookie de session
    response.cookies.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });

    return response;

  } catch (error) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 