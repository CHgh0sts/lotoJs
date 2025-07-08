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

    // Chercher des utilisateurs temporaires avec le même nom/prénom pour fusion
    const temporaryUsers = await prisma.user.findMany({
      where: {
        nom: { equals: user.nom, mode: 'insensitive' },
        prenom: { equals: user.prenom, mode: 'insensitive' },
        isTemporary: true,
        id: { not: user.id }
      },
      include: {
        Carton: true,
        UserGame: true
      }
    });

    // Fusionner les comptes temporaires avec le compte réel
    const mergedGameIds = [];
    for (const tempUser of temporaryUsers) {
      // Récupérer les gameIds affectés pour notifications
      const gameIds = tempUser.UserGame.map(ug => ug.gameId);
      mergedGameIds.push(...gameIds);

      // Transférer les cartons
      await prisma.carton.updateMany({
        where: { userId: tempUser.id },
        data: { userId: user.id }
      });

      // Transférer les UserGame (liens vers les parties)
      await prisma.userGame.updateMany({
        where: { userId: tempUser.id },
        data: { userId: user.id }
      });

      // Supprimer l'utilisateur temporaire
      await prisma.user.delete({
        where: { id: tempUser.id }
      });

      console.log(`Fusion du compte temporaire ${tempUser.nom} ${tempUser.prenom} avec le compte réel`);
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
      user: sessionData,
      mergedAccounts: temporaryUsers.length > 0 ? {
        count: temporaryUsers.length,
        gameIds: [...new Set(mergedGameIds)]
      } : null
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