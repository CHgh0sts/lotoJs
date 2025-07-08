import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Assigner ou désassigner un carton à un groupe
export async function PUT(request) {
  try {
    const { cartonId, groupId } = await request.json();
    
    if (!cartonId) {
      return NextResponse.json({ error: 'cartonId is required' }, { status: 400 });
    }

    // groupId peut être null pour désassigner
    const carton = await prisma.carton.update({
      where: { id: cartonId },
      data: { groupId: groupId || null },
      include: {
        user: true,
        group: true
      }
    });

    return NextResponse.json(carton);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Assigner plusieurs cartons à un groupe
export async function POST(request) {
  try {
    const { cartonIds, groupId } = await request.json();
    
    if (!cartonIds || !Array.isArray(cartonIds)) {
      return NextResponse.json({ error: 'cartonIds array is required' }, { status: 400 });
    }

    // groupId peut être null pour désassigner
    const cartons = await prisma.carton.updateMany({
      where: { id: { in: cartonIds } },
      data: { groupId: groupId || null }
    });

    return NextResponse.json({ updated: cartons.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 