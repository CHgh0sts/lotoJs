'use client';

import { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import Carton from './Carton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash, Plus } from 'lucide-react';
import CreateCartonDialog from './CreateCartonDialog';
import CreateUserDialog from './CreateUserDialog';
import { socket } from '@/lib/socketClient';
export default function EditUsersInfoDialog({ isOpen, onClose, gameId = '' }) {
  const { toast } = useToast();
  const { listUsers, setListUsers, listCartons, setListCartons, numbers } = useContext(GlobalContext);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [openCreateCartonDialog, setOpenCreateCartonDialog] = useState(false);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteUser = async userId => {
    const response = await fetch('/api/users', {
      method: 'DELETE',
      body: JSON.stringify({ id: userId })
    });
    if (response.ok) {
      toast({
        title: 'Utilisateur supprimé avec succès'
      });
      setListUsers(listUsers.filter(user => user.id !== userId));
      setSelectedFilter('all');
    } else {
      toast({
        title: "Erreur lors de la suppression de l'utilisateur"
      });
    }
  };

  const confirmDelete = userId => {
    setUserToDelete(userId);
    setConfirmDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await handleDeleteUser(userToDelete);
      setUserToDelete(null);
      socket.emit('updateListUsers', { gameId: gameId, listUsers: listUsers.filter(user => user.id !== userToDelete) });
    }
    setConfirmDeleteDialog(false);
  };

  const handleDeleteCarton = async carton => {
    try {
      const response = await fetch('/api/cartons', {
        method: 'DELETE',
        body: JSON.stringify({ id: carton.id })
      });
      if (response.ok) {
        toast({
          title: 'Carton supprimé avec succès'
        });
        setListCartons(listCartons.filter(c => c.id !== carton.id));
      } else {
        toast({
          title: 'Erreur lors de la suppression du carton'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du carton:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle style={{ display: 'none' }}>Edit Game</DialogTitle>
          <div className="flex items-center justify-center">
            <div className="relative listeUsersflex flex-col w-[25vh] border-r border-gray-600 h-full">
              <ul className="listUsers">
                <li onClick={() => setSelectedFilter('all')} className={`${selectedFilter === 'all' ? 'selected' : ''}`}>
                  <p className="flex items-center px-2 py-1">
                    <span className={`selectedFilter`}></span>
                    All Utilisateurs
                  </p>
                </li>
                {listUsers.map(user => (
                  <li onClick={() => setSelectedFilter(user.id)} key={user.id} className={`${selectedFilter == user.id ? 'selected' : ''}`}>
                    <p className="flex items-center px-2 py-1">
                      <span className={`selectedFilter`}></span>
                      {user.nom} {user.prenom}
                    </p>
                  </li>
                ))}
              </ul>
              <button onClick={() => setOpenCreateUserDialog(true)} className="absolute bottom-0 w-[90%] left-1/2 -translate-x-1/2 mb-2 text-center text-[1.4vh] bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
                Ajouter un utilisateur
              </button>
            </div>
            <div className="containerEditGame flex flex-col w-full h-full">
              <div className="topOptions relative w-full h-[6vh] border-b border-gray-600 flex items-center justify-between px-2">
                <h2 className="text-[1.8vh]">
                  {selectedFilter === 'all'
                    ? 'Tous les utilisateurs'
                    : (() => {
                        const user = listUsers.find(user => user.id === selectedFilter);
                        return user ? `${user.nom} ${user.prenom}` : 'Utilisateur non trouvé';
                      })()}
                </h2>
                {selectedFilter != 'all' && (
                  <div className="btnOptions flex items-center">
                    <button onClick={() => setOpenCreateCartonDialog({ userId: selectedFilter, gameId: gameId })} className="bg-green-700 text-[1.4vh] hover:bg-green-800 text-white p-2 rounded-md mr-2 flex items-center">
                      <Plus className="w-[1.8vh] h-[1.8vh]" /> Carton
                    </button>
                    <button onClick={() => confirmDelete(selectedFilter)} className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-md">
                      <Trash className="w-[1.8vh] h-[1.8vh]" />
                    </button>
                  </div>
                )}
              </div>
              <div className="listCartons w-full flex flex-col h-[83vh] overflow-x-hidden items-center">
                <ul className="listCartonUl w-full max-w-[65vh]">
                  {listCartons
                    .filter(carton => (selectedFilter == 'all' ? true : carton.userId == selectedFilter))
                    .map(carton => (
                      <li key={carton.id} className="listCartonLi">
                        <Carton cartonInitial={carton} listNumber={numbers} onDelete={handleDeleteCarton} />
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CreateCartonDialog isOpen={openCreateCartonDialog} params={{ userId: selectedFilter, gameId: gameId }} onClose={() => setOpenCreateCartonDialog(false)} />
      <CreateUserDialog isOpen={openCreateUserDialog} onClose={() => setOpenCreateUserDialog(false)} gameId={gameId} />
      {confirmDeleteDialog && (
        <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
          <DialogContent className="h-[fit-content] w-[fit-content] p-4">
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <p className="text-[1.6vh] text-gray-400">Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
            <div className="flex justify-end mt-4">
              <button onClick={() => setConfirmDeleteDialog(false)} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md mr-2">
                Annuler
              </button>
              <button onClick={handleConfirmDelete} className="bg-red-700 hover:bg-red-800 text-white px-2 rounded-md">
                Confirmer
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
