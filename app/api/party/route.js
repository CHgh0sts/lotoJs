import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genererChaineAleatoire = (longueur) => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: longueur }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
};

export async function GET(req, context) {
    
    
}
export async function POST(req, context) {
    const prisma = new PrismaClient();
    
    
}
export async function PUT(request) {
    try {
      const data = await request.json();

      if(!data.gameId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      let party = await prisma.party.findFirst({
        where: {
          id: data.partyId,
        }
      });
      
      if(!party) {
        const partyId = genererChaineAleatoire(10)
        const game = await prisma.game.findFirst({
          where: {
            gameId: data.gameId
          }
        });
        
        if(!game) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }
        const newParty = await prisma.party.create({
          data: {
            partyId: partyId,
            gameId: game.id,
          }
        });
        console.log('newParty', newParty);
        party = newParty;
      }
      
      const updatedParty = await prisma.party.update({
        where: {
            id: party.id,
        },
        data: {
          listNumber: data.listNumber.map(num => String(num))
        }
      });
      return NextResponse.json(updatedParty);
    } catch (error) {
        console.log(error);
        
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
export async function DELETE(req, context) {

}