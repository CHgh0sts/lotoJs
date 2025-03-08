'use client';
import React, { useContext, useEffect, useState } from 'react';
import ListNumber from '@/components/custom/game/ListNumber';
import { GlobalContext } from '@/lib/GlobalState';
import { useParams } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import LastNumber from '@/components/custom/game/LastNumber';
import { UsersRound, Link, LogOut, ChartNoAxesColumn } from 'lucide-react';
import EditUsersInfoDialog from '@/components/custom/game/EditUsersInfoDialog';
import CreateLinkDialog from '@/components/custom/game/CreateLinkDialog';
import { toast } from 'sonner';
export default function Page() {
  const { setNumbers, listTypeParty, setListTypeParty, setMe, me, setListUsers, setListCartons, numbers, listCartons } = useContext(GlobalContext);
  const params = useParams();
  const [gameId, setGameId] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const [party, setParty] = useState(null);
  const [typeParty, setTypeParty] = useState(1);
  const [openEditUsersInfoDialog, setOpenEditUsersInfoDialog] = useState(false);
  const [openCreateLinkDialog, setOpenCreateLinkDialog] = useState(false);
  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params;
      setGameSession(resolvedParams.idGame);
    }
    fetchParams();
    async function fetchGame() {
      const response = await fetch(`/api/game/${gameSession}`, {
        method: 'GET'
      });
      const data = await response.json();
      console.log(data);
      setParty(data.game.Party[data.game.Party.length - 1].id);
      setTypeParty(data.game.Party[data.game.Party.length - 1].typePartyId);
      setGameId(data.game.gameId);
      setMe(data.user);
      const listNumber = data.game.Party[data.game.Party.length - 1].listNumber.map(num => parseInt(num));
      setNumbers(listNumber);
    }
    async function fetchTypeParty() {
      const response = await fetch(`/api/typeParty`, {
        method: 'GET'
      });
      const data = await response.json();
      setListTypeParty(data);
    }
    async function fetchUsers() {
      const response = await fetch(`/api/users`, {
        method: 'GET'
      });
      const data = await response.json();
      setListUsers(data);
    }
    async function fetchCartons() {
      const response = await fetch(`/api/cartons/${gameSession}`, {
        method: 'GET'
      });
      const data = await response.json();
      setListCartons(data);
    }
    if (gameSession) {
      fetchGame();
      fetchTypeParty();
      fetchUsers();
      fetchCartons();
    }
  }, [gameSession]);

  useEffect(() => {
    listCartons.map(carton => {
      const cleanedNumbers = carton.listNumber.filter(num => num !== '*').map(num => parseInt(num));
      const subArrays = [];
      for (let i = 0; i < cleanedNumbers.length; i += 5) {
        subArrays.push(cleanedNumbers.slice(i, i + 5));
      }

      const nbtLigneWin = subArrays.reduce((count, subArray) => {
        if (subArray.every(num => numbers.includes(num))) {
          return count + 1;
        }
        return count;
      }, 0);
      console.log(`nbtLigneWin: ${nbtLigneWin}`);
      if (nbtLigneWin === typeParty) {
        console.log(carton);
        toast.success(`${carton.user.nom} ${carton.user.prenom} a gagné avec le carton ${carton.id}`);
      }
    });
  }, [numbers]);

  useEffect(() => {
    socket.on('typePartyUpdated', data => {
      setTypeParty(data.typePartyId);
    });
    socket.on('newPartyCreated', data => {
      console.log(data.party);
      setParty(data.party?.id);
      setTypeParty(data.party?.typePartyId);
      setNumbers([]);
    });
    socket.on('listUsersUpdated', data => {
      setListUsers(data.listUsers);
    });
  }, []);

  const handleTypeParty = async id => {
    socket.emit('updateTypeParty', {
      gameId: gameId,
      partyId: party,
      typePartyId: id
    });
    async function updateParty() {
      const response = await fetch(`/api/updateTypeParty`, {
        method: 'PUT',
        body: JSON.stringify({
          partyId: party,
          typePartyId: id
        })
      });
      const data = await response.json();
      setTypeParty(data.party.typePartyId);
    }
    updateParty();
  };
  const handleNewParty = () => {
    async function updateParty() {
      const response = await fetch(`/api/newParty`, {
        method: 'POST',
        body: JSON.stringify({
          party: party,
          gameId: gameId
        })
      });
      const data = await response.json();
      setParty(data.newParty.id);
      setTypeParty(data.newParty.typePartyId);
      setNumbers([]);
      socket.emit('newParty', { party: data.newParty, gameId: gameId });
    }
    updateParty();
  };
  const handleLink = () => {
    setOpenCreateLinkDialog(true);
  };
  const handleLogout = () => {
    window.location.href = '/';
  };
  if (!gameId) return <div>Chargement...</div>;

  return (
    <>
      <div className="relative w-full max-w-[50vh] flex flex-col items-center justify-center h-screen">
        <ListNumber gameSession={gameId} party={party} gameId={gameId} />
        <div className="relative w-full">
          <ul className="flex items-center justify-center w-full max-w-[50vh]">
            {listTypeParty.map(type => (
              <li onClick={() => handleTypeParty(type.id)} key={type.id} className={`w-[33%] p-2 h-10 flex items-center justify-center cursor-pointer ${type.id === typeParty ? 'bg-green-700' : 'bg-gray-800 hover:bg-gray-700'}`}>
                {type.name}
              </li>
            ))}
          </ul>
        </div>
        <LastNumber />
        <button onClick={handleNewParty} className="bg-green-700 hover:bg-green-800 mt-4 text-white p-2 rounded-md">
          Partie remporté
        </button>
      </div>
      <button onClick={() => setOpenEditUsersInfoDialog(true)} className="listusers absolute bottom-0 right-0 m-2 bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
        <UsersRound />
      </button>
      <button onClick={handleLink} className="listusers absolute top-0 left-0 m-2 bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
        <Link />
      </button>
      <div className="absolute top-0 right-0 m-2">
        <button onClick={handleLogout} className="listusers bg-green-700 hover:bg-green-800 text-white p-2 rounded-md m-2">
          <ChartNoAxesColumn />
        </button>
        <button onClick={handleLogout} className="listusers bg-red-700 hover:bg-red-800 text-white p-2 rounded-md">
          <LogOut />
        </button>
      </div>
      <EditUsersInfoDialog isOpen={openEditUsersInfoDialog} onClose={setOpenEditUsersInfoDialog} gameId={gameId} />
      <CreateLinkDialog isOpen={openCreateLinkDialog} onClose={setOpenCreateLinkDialog} gameId={gameId} />
    </>
  );
}
