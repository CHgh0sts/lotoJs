import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request) {
    try {
        const { id, ListNumber, groupId } = await request.json();
        
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const carton = await prisma.carton.update({
            where: { id: id },
            data: {
                listNumber: ListNumber,
                groupId: groupId || null
            },
            include: {
                game: true,
                user: true,
                group: true
            }
        });

        return NextResponse.json({ carton }, { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du carton:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 