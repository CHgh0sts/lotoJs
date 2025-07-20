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
  const [isDesktop, setIsDesktop] = useState(false);

  // Détecter la taille d'écran côté client pour éviter l'erreur d'hydratation
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);

    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

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
        const response = await fetch(`/api/game/${gameSession}/users`, {
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
      <div className="h-screen w-full flex flex-col bg-gray-900" style={{ overflow: 'hidden' }}>
        {/* Header avec boutons de navigation */}
        <header className="flex-shrink-0 w-full flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
          <div className="flex gap-2">
            <button onClick={handleLink} className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
              <Link className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {isDesktop && <ListNumberBeforeWin typeParty={typeParty} className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md" />}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setOpenCartonGroupsManager(true)} className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-md">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={handleStats} className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
              <ChartNoAxesColumn className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={handleLogout} className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-md">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Zone de jeu principale - Design différent PC vs Mobile */}
        {isDesktop ? (
          /* Layout PC - Disposition horizontale optimisée */
          <main className="flex-1 flex h-full overflow-hidden">
            {/* Section gauche - Grille des numéros */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-4xl">
                <ListNumber gameSession={gameId} party={party} gameId={gameId} />
              </div>
            </div>

            {/* Section droite - Contrôles et infos */}
            <div className="w-80 flex-shrink-0 bg-gray-800 border-l border-gray-700 p-6 flex flex-col space-y-6">
              {/* Dernier numéro */}
              <div className="flex-shrink-0">
                <LastNumber />
              </div>

              {/* Sélecteur de type de partie */}
              <div className="flex-shrink-0">
                <h3 className="text-white text-lg font-semibold mb-3">Type de partie</h3>
                <div className="space-y-2">
                  {listTypeParty.map(type => (
                    <button key={type.id} onClick={() => handleTypeParty(type.id)} className={`w-full p-3 rounded-lg transition-colors text-left ${type.id === typeParty ? 'bg-green-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white/80'}`}>
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions de partie */}
              <div className="flex-shrink-0 space-y-4">
                <button onClick={handleNewParty} className="w-full bg-green-700 hover:bg-green-800 text-white p-3 rounded-lg font-medium transition-colors">
                  Partie remportée
                </button>

                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="clearTable" checked={clearTableOnNewParty} onChange={e => setClearTableOnNewParty(e.target.checked)} className="custom-checkbox" />
                  <label htmlFor="clearTable" className="text-white text-sm cursor-pointer">
                    Vider le tableau pour la nouvelle partie
                  </label>
                </div>
              </div>

              {/* Bouton des utilisateurs */}
              <div className="flex-shrink-0 mt-auto">
                <button onClick={() => setOpenEditUsersInfoDialog(true)} className="w-full bg-green-700 hover:bg-green-800 text-white p-3 rounded-lg flex items-center justify-center space-x-2">
                  <UsersRound className="w-5 h-5" />
                  <span>Gérer les utilisateurs</span>
                </button>
              </div>
            </div>
          </main>
        ) : (
          /* Layout Mobile - Disposition verticale */
          <main className="flex-1 flex flex-col items-center justify-center p-2 space-y-3 sm:space-y-4" style={{ overflow: 'hidden' }}>
            <div className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[70vw] lg:max-w-[60vw]">
              <ListNumber gameSession={gameId} party={party} gameId={gameId} />
            </div>

            {/* Sélecteur de type de partie */}
            <div className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[70vw] lg:max-w-[60vw]">
              <ul className="flex items-center justify-center w-full border border-white/20 rounded-lg overflow-hidden">
                {listTypeParty.map(type => (
                  <li onClick={() => handleTypeParty(type.id)} key={type.id} className={`flex-1 p-2 h-10 sm:h-12 flex items-center justify-center cursor-pointer transition-colors text-sm sm:text-base ${type.id === typeParty ? 'bg-green-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white/80'}`}>
                    {type.name}
                  </li>
                ))}
              </ul>
            </div>

            <LastNumber />

            {/* Actions de partie */}
            <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
              <button onClick={handleNewParty} className="w-full bg-green-700 hover:bg-green-800 text-white p-2 sm:p-3 rounded-md font-medium transition-colors text-sm sm:text-base">
                Partie remportée
              </button>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="clearTable" checked={clearTableOnNewParty} onChange={e => setClearTableOnNewParty(e.target.checked)} className="custom-checkbox" />
                <label htmlFor="clearTable" className="text-white text-xs cursor-pointer">
                  Vider le tableau pour la nouvelle partie
                </label>
              </div>
            </div>

            {/* Bouton des utilisateurs en bas à droite */}
            <button onClick={() => setOpenEditUsersInfoDialog(true)} className="fixed bottom-4 right-4 bg-green-700 hover:bg-green-800 text-white p-3 rounded-full shadow-lg z-10">
              <UsersRound className="w-5 h-5" />
            </button>
          </main>
        )}
      </div>

      {/* Dialogs */}
      <EditUsersInfoDialog isOpen={openEditUsersInfoDialog} onClose={setOpenEditUsersInfoDialog} gameId={gameId} gameSession={gameSession} />
      <CreateLinkDialog isOpen={openCreateLinkDialog} onClose={setOpenCreateLinkDialog} gameId={gameId} />
      <CartonGroupsManager isOpen={openCartonGroupsManager} onClose={() => setOpenCartonGroupsManager(false)} gameId={gameId} />
      <StatsDialog isOpen={openStatsDialog} onClose={() => setOpenStatsDialog(false)} gameId={gameId} gameSession={gameSession} />
    </AuthWrapper>
  );
}
