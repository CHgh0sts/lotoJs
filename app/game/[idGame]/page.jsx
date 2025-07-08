'use client';
import React, { useContext, useEffect, useState } from 'react';
import ListNumber from '@/components/custom/game/ListNumber';
import { GlobalContext } from '@/lib/GlobalState';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import LastNumber from '@/components/custom/game/LastNumber';
import { UsersRound, Link, LogOut, ChartNoAxesColumn, Layers } from 'lucide-react';
import EditUsersInfoDialog from '@/components/custom/game/EditUsersInfoDialog';
import CreateLinkDialog from '@/components/custom/game/CreateLinkDialog';
import CartonGroupsManager from '@/components/custom/game/CartonGroupsManager';
import StatsDialog from '@/components/custom/game/StatsDialog';
import { toast } from 'sonner';
import ListNumberBeforeWin from '@/components/custom/game/ListNumberBeforeWin';
import { useAuth } from '@/lib/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';

export default function Page() {
  const { setNumbers, listTypeParty, setListTypeParty, setMe, me, setListUsers, setListCartons, numbers, listCartons } = useContext(GlobalContext);
  const params = useParams();
  const router = useRouter();
  const { logout } = useAuth();
  const [gameId, setGameId] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const [party, setParty] = useState(null);
  const [typeParty, setTypeParty] = useState(1);
  const [openEditUsersInfoDialog, setOpenEditUsersInfoDialog] = useState(false);
  const [openCreateLinkDialog, setOpenCreateLinkDialog] = useState(false);
  const [openCartonGroupsManager, setOpenCartonGroupsManager] = useState(false);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [clearTableOnNewParty, setClearTableOnNewParty] = useState(true);
  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params;
      setGameSession(resolvedParams.idGame);
    }
    fetchParams();
    async function fetchGame() {
      try {
        const response = await fetch(`/api/game/${gameSession}`, {
          method: 'GET'
        });

        if (!response.ok) {
          console.error('Erreur response fetchGame:', response.status);
          return;
        }

        const data = await response.json();
        console.log(data);

        if (data?.game?.Party && data.game.Party.length > 0) {
          setParty(data.game.Party[data.game.Party.length - 1].id);
          setTypeParty(data.game.Party[data.game.Party.length - 1].typePartyId);
          setGameId(data.game.gameId);
          setMe(data.user);
          const listNumber = data.game.Party[data.game.Party.length - 1].listNumber.map(num => parseInt(num));
          setNumbers(listNumber);
        }
      } catch (error) {
        console.error('Erreur fetchGame:', error);
      }
    }
    async function fetchTypeParty() {
      try {
        const response = await fetch(`/api/typeParty`, {
          method: 'GET'
        });

        if (!response.ok) {
          console.error('Erreur response fetchTypeParty:', response.status);
          return;
        }

        const data = await response.json();
        setListTypeParty(data);
      } catch (error) {
        console.error('Erreur fetchTypeParty:', error);
      }
    }
    async function fetchUsers() {
      try {
        const response = await fetch(`/api/users`, {
          method: 'GET'
        });

        if (!response.ok) {
          console.error('Erreur response fetchUsers:', response.status);
          return;
        }

        const data = await response.json();
        setListUsers(data);
      } catch (error) {
        console.error('Erreur fetchUsers:', error);
      }
    }
    async function fetchCartons() {
      try {
        const response = await fetch(`/api/cartons/${gameSession}`, {
          method: 'GET'
        });

        if (!response.ok) {
          console.error('Erreur response fetchCartons:', response.status);
          return;
        }

        const data = await response.json();
        setListCartons(data.activeCartons || data);
      } catch (error) {
        console.error('Erreur fetchCartons:', error);
      }
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
      try {
        const response = await fetch(`/api/updateTypeParty`, {
          method: 'PUT',
          body: JSON.stringify({
            partyId: party,
            typePartyId: id
          })
        });

        if (!response.ok) {
          console.error('Erreur response updateTypeParty:', response.status);
          return;
        }

        const data = await response.json();
        if (data?.party?.typePartyId) {
          setTypeParty(data.party.typePartyId);
        }
      } catch (error) {
        console.error('Erreur updateTypeParty:', error);
      }
    }
    updateParty();
  };
  const handleNewParty = () => {
    async function updateParty() {
      try {
        const response = await fetch(`/api/newParty`, {
          method: 'POST',
          body: JSON.stringify({
            party: party,
            gameId: gameId
          })
        });

        if (!response.ok) {
          console.error('Erreur response newParty:', response.status);
          return;
        }

        const data = await response.json();

        if (data?.newParty) {
          setParty(data.newParty.id);
          setTypeParty(data.newParty.typePartyId);

          // Si clearTableOnNewParty est true, on vide le tableau, sinon on garde les numéros
          const newNumbers = clearTableOnNewParty ? [] : numbers;
          setNumbers(newNumbers);
          socket.emit('newParty', { party: data.newParty, gameId: gameId, numbers: newNumbers });
        }
      } catch (error) {
        console.error('Erreur newParty:', error);
      }
    }
    updateParty();
  };
  const handleLink = () => {
    setOpenCreateLinkDialog(true);
  };
  const handleLogout = () => {
    logout();
  };

  const handleStats = () => {
    setOpenStatsDialog(true);
  };
  if (!gameId) return <div>Chargement...</div>;

  return (
    <AuthWrapper>
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
        <div className="flex flex-col items-center mt-4 space-y-3">
          <button onClick={handleNewParty} className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
            Partie remportée
          </button>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="clearTable" checked={clearTableOnNewParty} onChange={e => setClearTableOnNewParty(e.target.checked)} className="custom-checkbox" />
            <label htmlFor="clearTable" className="text-white text-sm cursor-pointer">
              Vider le tableau pour la nouvelle partie
            </label>
          </div>
        </div>
      </div>
      {window.innerWidth > 768 && <ListNumberBeforeWin typeParty={typeParty} className="absolute top-0 left-0 m-2 bg-green-700 hover:bg-green-800 text-white p-2 rounded-md" />}
      <button onClick={() => setOpenEditUsersInfoDialog(true)} className="listusers absolute bottom-0 right-0 m-2 bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
        <UsersRound />
      </button>
      <button onClick={handleLink} className="listusers absolute top-0 left-0 m-2 bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
        <Link />
      </button>
      <div className="absolute top-0 right-0 m-2">
        <button onClick={() => setOpenCartonGroupsManager(true)} className="listusers bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-md m-2">
          <Layers />
        </button>
        <button onClick={handleStats} className="listusers bg-green-700 hover:bg-green-800 text-white p-2 rounded-md m-2">
          <ChartNoAxesColumn />
        </button>
        <button onClick={handleLogout} className="listusers bg-red-700 hover:bg-red-800 text-white p-2 rounded-md">
          <LogOut />
        </button>
      </div>
      <EditUsersInfoDialog isOpen={openEditUsersInfoDialog} onClose={setOpenEditUsersInfoDialog} gameId={gameId} gameSession={gameSession} />
      <CreateLinkDialog isOpen={openCreateLinkDialog} onClose={setOpenCreateLinkDialog} gameId={gameId} />
      <CartonGroupsManager isOpen={openCartonGroupsManager} onClose={() => setOpenCartonGroupsManager(false)} gameId={gameId} />
      <StatsDialog isOpen={openStatsDialog} onClose={() => setOpenStatsDialog(false)} gameId={gameId} gameSession={gameSession} />
    </AuthWrapper>
  );
}
