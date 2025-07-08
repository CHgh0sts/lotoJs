'use client';

import { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import Carton from './Carton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash, Plus, Edit2 } from 'lucide-react';
import CreateCartonDialog from './CreateCartonDialog';
import EditCartonDialog from './EditCartonDialog';
import CreateUserDialog from './CreateUserDialog';
import { socket } from '@/lib/socketClient';

export default function EditUsersInfoDialog({ isOpen, onClose, gameId = '', gameSession }) {
  const { toast } = useToast();
  const { listUsers, setListUsers, listCartons, setListCartons, numbers } = useContext(GlobalContext);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [openCreateCartonDialog, setOpenCreateCartonDialog] = useState(false);
  const [openEditCartonDialog, setOpenEditCartonDialog] = useState(false);
  const [editingCarton, setEditingCarton] = useState(null);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showUsersList, setShowUsersList] = useState(true);

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

  // Fonction pour recharger les cartons depuis l'API
  const refreshCartons = async () => {
    try {
      const response = await fetch(`/api/cartons/${gameSession || gameId}`, {
        method: 'GET'
      });
      const data = await response.json();
      setListCartons(data.activeCartons || data);
    } catch (error) {
      console.error('Erreur lors du rechargement des cartons:', error);
    }
  };

  const handleEditCarton = carton => {
    setEditingCarton(carton);
    setOpenEditCartonDialog(true);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden">
          <DialogTitle style={{ display: 'none' }}>Edit Game</DialogTitle>

          {/* Version Desktop */}
          <div className="hidden md:flex h-full">
            {/* Sidebar des utilisateurs */}
            <div className="relative flex flex-col w-64 lg:w-80 border-r border-gray-600 h-full bg-gray-800">
              <div className="flex-1 overflow-y-auto">
                <ul className="listUsers p-2">
                  <li onClick={() => setSelectedFilter('all')} className={`cursor-pointer rounded-md mb-1 transition-colors ${selectedFilter === 'all' ? 'bg-green-700 text-white' : 'hover:bg-gray-700'}`}>
                    <p className="flex items-center px-3 py-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Tous les utilisateurs
                    </p>
                  </li>
                  {listUsers.map(user => (
                    <li onClick={() => setSelectedFilter(user.id)} key={user.id} className={`cursor-pointer rounded-md mb-1 transition-colors ${selectedFilter == user.id ? 'bg-green-700 text-white' : 'hover:bg-gray-700'}`}>
                      <p className="flex items-center px-3 py-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        <span className="truncate">
                          {user.nom} {user.prenom}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-2 border-t border-gray-600">
                <button onClick={() => setOpenCreateUserDialog(true)} className="w-full text-sm bg-green-700 hover:bg-green-800 text-white p-2 rounded-md transition-colors">
                  + Ajouter utilisateur
                </button>
              </div>
            </div>

            {/* Contenu principal Desktop */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-gray-900">
                <h2 className="text-xl font-semibold truncate">
                  {selectedFilter === 'all'
                    ? 'Tous les utilisateurs'
                    : (() => {
                        const user = listUsers.find(user => user.id === selectedFilter);
                        return user ? `${user.nom} ${user.prenom}` : 'Utilisateur non trouvé';
                      })()}
                </h2>
                {selectedFilter != 'all' && (
                  <div className="flex gap-2">
                    <button onClick={() => setOpenCreateCartonDialog({ userId: selectedFilter, gameId: gameId })} className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-md flex items-center text-sm transition-colors">
                      <Plus className="w-4 h-4 mr-1" /> Carton
                    </button>
                    <button onClick={handleToggleEditMode} className={`text-white px-3 py-2 rounded-md flex items-center text-sm transition-colors ${isEditMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-700 hover:bg-gray-800'}`}>
                      <Edit2 className="w-4 h-4 mr-1" /> {isEditMode ? 'Arrêter' : 'Éditer'}
                    </button>
                    <button onClick={() => confirmDelete(selectedFilter)} className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-md transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {listCartons.filter(carton => (selectedFilter == 'all' ? true : carton.userId == selectedFilter)).length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-center">{selectedFilter === 'all' ? 'Aucun carton disponible' : 'Aucun carton pour cet utilisateur'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {listCartons
                      .filter(carton => (selectedFilter == 'all' ? true : carton.userId == selectedFilter))
                      .map(carton => (
                        <div key={carton.id} className="flex justify-center">
                          <Carton cartonInitial={carton} listNumber={numbers} onDelete={handleDeleteCarton} onEdit={handleEditCarton} isEditMode={isEditMode} height="8vh" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Version Mobile */}
          <div className="md:hidden flex flex-col h-full">
            {showUsersList ? (
              /* Liste des utilisateurs Mobile */
              <div className="flex flex-col h-full bg-gray-800">
                <div className="p-4 border-b border-gray-600 bg-gray-900">
                  <h2 className="text-lg font-semibold text-center">Sélectionner un utilisateur</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setSelectedFilter('all');
                        setShowUsersList(false);
                      }}
                      className={`w-full p-3 rounded-lg border-2 transition-colors ${selectedFilter === 'all' ? 'border-green-500 bg-green-700 text-white' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                        <span className="font-medium">Tous les utilisateurs</span>
                      </div>
                    </button>
                    {listUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedFilter(user.id);
                          setShowUsersList(false);
                        }}
                        className={`w-full p-3 rounded-lg border-2 transition-colors ${selectedFilter == user.id ? 'border-green-500 bg-green-700 text-white' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'}`}
                      >
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                          <span className="font-medium">
                            {user.nom} {user.prenom}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 border-t border-gray-600">
                  <button onClick={() => setOpenCreateUserDialog(true)} className="w-full bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                    + Ajouter un utilisateur
                  </button>
                </div>
              </div>
            ) : (
              /* Vue des cartons Mobile */
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-600 bg-gray-900">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowUsersList(true)} className="text-green-500 hover:text-green-400 font-medium">
                      ← Retour
                    </button>
                    <h2 className="text-lg font-semibold truncate mx-4">
                      {selectedFilter === 'all'
                        ? 'Tous les utilisateurs'
                        : (() => {
                            const user = listUsers.find(user => user.id === selectedFilter);
                            return user ? `${user.nom} ${user.prenom}` : 'Utilisateur non trouvé';
                          })()}
                    </h2>
                    <div className="w-16"></div>
                  </div>
                  {selectedFilter != 'all' && (
                    <div className="flex gap-2 mt-3 justify-center">
                      <button onClick={() => setOpenCreateCartonDialog({ userId: selectedFilter, gameId: gameId })} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center text-sm transition-colors">
                        <Plus className="w-4 h-4 mr-1" /> Carton
                      </button>
                      <button onClick={handleToggleEditMode} className={`text-white px-4 py-2 rounded-md flex items-center text-sm transition-colors ${isEditMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-700 hover:bg-gray-800'}`}>
                        <Edit2 className="w-4 h-4 mr-1" /> {isEditMode ? 'Stop' : 'Edit'}
                      </button>
                      <button onClick={() => confirmDelete(selectedFilter)} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {listCartons.filter(carton => (selectedFilter == 'all' ? true : carton.userId == selectedFilter)).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p className="text-center">{selectedFilter === 'all' ? 'Aucun carton disponible' : 'Aucun carton pour cet utilisateur'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {listCartons
                        .filter(carton => (selectedFilter == 'all' ? true : carton.userId == selectedFilter))
                        .map(carton => (
                          <div key={carton.id} className="flex justify-center">
                            <Carton cartonInitial={carton} listNumber={numbers} onDelete={handleDeleteCarton} onEdit={handleEditCarton} isEditMode={isEditMode} height="18vh" />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <CreateCartonDialog isOpen={openCreateCartonDialog} params={{ userId: selectedFilter, gameId: gameId }} onClose={() => setOpenCreateCartonDialog(false)} onCartonCreated={refreshCartons} />
      <EditCartonDialog
        isOpen={openEditCartonDialog}
        carton={editingCarton}
        onClose={() => {
          setOpenEditCartonDialog(false);
          setEditingCarton(null);
        }}
        onCartonUpdated={refreshCartons}
      />
      <CreateUserDialog isOpen={openCreateUserDialog} onClose={() => setOpenCreateUserDialog(false)} gameId={gameId} />
      {confirmDeleteDialog && (
        <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
          <DialogContent className="max-w-md w-[90vw] p-6">
            <DialogTitle className="text-lg font-semibold mb-4">Confirmer la suppression</DialogTitle>
            <p className="text-gray-400 mb-6">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button onClick={() => setConfirmDeleteDialog(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors order-2 sm:order-1">
                Annuler
              </button>
              <button onClick={handleConfirmDelete} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors order-1 sm:order-2">
                Confirmer la suppression
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
