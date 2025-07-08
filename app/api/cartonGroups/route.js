import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer tous les groupes d'un jeu
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    
    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
    }

    const game = await prisma.game.findFirst({
      where: { gameId: gameId }
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const groups = await prisma.cartonGroup.findMany({
      where: { gameId: game.id },
      include: {
        cartons: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Créer un nouveau groupe
export async function POST(request) {
  try {
    const { name, gameId } = await request.json();
    
    if (!name || !gameId) {
      return NextResponse.json({ error: 'name and gameId are required' }, { status: 400 });
    }

    const game = await prisma.game.findFirst({
      where: { gameId: gameId }
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const group = await prisma.cartonGroup.create({
      data: {
        name,
        gameId: game.id
      }
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Mettre à jour un groupe (nom ou statut actif)
export async function PUT(request) {
  try {
    const { id, name, active } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;

    const group = await prisma.cartonGroup.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Supprimer un groupe
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Retirer l'association des cartons avec ce groupe
    await prisma.carton.updateMany({
      where: { groupId: id },
      data: { groupId: null }
    });

    // Supprimer le groupe
    const group = await prisma.cartonGroup.delete({
      where: { id }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 