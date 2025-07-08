'use client';

import { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CartonGroupsManager({ isOpen, onClose, gameId }) {
  const { listCartons, setListCartons } = useContext(GlobalContext);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [selectedCartons, setSelectedCartons] = useState([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Charger les groupes au montage du composant
  useEffect(() => {
    if (isOpen && gameId) {
      fetchGroups();
    }
  }, [isOpen, gameId]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`/api/cartonGroups?gameId=${gameId}`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
      toast.error('Erreur lors du chargement des groupes');
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Le nom du groupe est requis');
      return;
    }

    try {
      const response = await fetch('/api/cartonGroups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, gameId })
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups([...groups, newGroup]);
        setNewGroupName('');
        toast.success('Groupe créé avec succès');
      } else {
        toast.error('Erreur lors de la création du groupe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du groupe');
    }
  };

  const updateGroup = async (groupId, updates) => {
    try {
      const response = await fetch('/api/cartonGroups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupId, ...updates })
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        setGroups(groups.map(g => (g.id === groupId ? updatedGroup : g)));
        toast.success('Groupe mis à jour');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteGroup = async groupId => {
    try {
      const response = await fetch('/api/cartonGroups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupId })
      });

      if (response.ok) {
        setGroups(groups.filter(g => g.id !== groupId));
        toast.success('Groupe supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const assignCartonsToGroup = async (cartonIds, groupId) => {
    try {
      const response = await fetch('/api/cartons/assignGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartonIds, groupId })
      });

      if (response.ok) {
        toast.success('Cartons assignés au groupe');
        fetchGroups(); // Recharger les groupes pour voir les changements
        // Mettre à jour la liste des cartons dans le contexte global
        const updatedCartons = listCartons.map(carton => (cartonIds.includes(carton.id) ? { ...carton, groupId, group: groups.find(g => g.id === groupId) } : carton));
        setListCartons(updatedCartons);
      } else {
        toast.error("Erreur lors de l'assignation");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'assignation");
    }
  };

  const handleEditGroup = group => {
    setEditingGroup(group.id);
    setEditGroupName(group.name);
  };

  const saveEditGroup = async () => {
    if (!editGroupName.trim()) {
      toast.error('Le nom du groupe est requis');
      return;
    }

    await updateGroup(editingGroup, { name: editGroupName });
    setEditingGroup(null);
    setEditGroupName('');
  };

  const handleCartonSelection = cartonId => {
    setSelectedCartons(prev => (prev.includes(cartonId) ? prev.filter(id => id !== cartonId) : [...prev, cartonId]));
  };

  const openAssignDialog = group => {
    setSelectedGroup(group);
    setShowAssignDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] bg-black text-white">
          <DialogTitle className="text-xl font-bold mb-4">Gestion des Groupes de Cartons</DialogTitle>

          <div className="flex h-full gap-6">
            {/* Section des groupes */}
            <div className="w-1/2 flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Groupes</h3>

              {/* Création d'un nouveau groupe */}
              <div className="flex gap-2 mb-4">
                <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Nom du nouveau groupe" className="flex-1 bg-gray-800 border-gray-600 text-white" />
                <Button onClick={createGroup} className="bg-green-700 hover:bg-green-800 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Liste des groupes */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {groups.map(group => (
                  <div key={group.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      {editingGroup === group.id ? (
                        <div className="flex gap-2 flex-1 items-center">
                          <Input value={editGroupName} onChange={e => setEditGroupName(e.target.value)} className="flex-1 bg-gray-700 border-gray-600 text-white text-sm h-8" />
                          <Button onClick={saveEditGroup} size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 px-2">
                            ✓
                          </Button>
                          <Button onClick={() => setEditingGroup(null)} size="sm" variant="outline" className="h-8 px-2">
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-white">{group.name}</span>
                          <div className="flex items-center gap-2">
                            <Switch checked={group.active} onCheckedChange={checked => updateGroup(group.id, { active: checked })} />
                            <Button onClick={() => handleEditGroup(group)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => openAssignDialog(group)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:text-white">
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => deleteGroup(group.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {group.cartons?.length || 0} cartons
                      {!group.active && <span className="ml-2 text-orange-400">(Inactif)</span>}
                    </div>
                  </div>
                ))}

                {groups.length === 0 && <div className="text-center text-gray-500 py-8">Aucun groupe créé</div>}
              </div>
            </div>

            {/* Section des cartons */}
            <div className="w-1/2 flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Cartons sans groupe</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {listCartons
                  .filter(carton => !carton.groupId)
                  .map(carton => (
                    <div key={carton.id} className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedCartons.includes(carton.id) ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'}`} onClick={() => handleCartonSelection(carton.id)}>
                      <div className="text-sm text-white">
                        <div className="font-medium">Carton #{carton.cartonId}</div>
                        <div className="text-gray-300">
                          {carton.user?.nom} {carton.user?.prenom}
                        </div>
                      </div>
                    </div>
                  ))}

                {listCartons.filter(carton => !carton.groupId).length === 0 && <div className="text-center text-gray-500 py-8">Tous les cartons sont assignés à des groupes</div>}
              </div>

              {selectedCartons.length > 0 && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="text-sm text-blue-400 font-medium">
                    {selectedCartons.length} carton{selectedCartons.length > 1 ? 's' : ''} sélectionné{selectedCartons.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'assignation */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-black text-white max-w-md">
          <DialogTitle className="text-lg font-semibold mb-4">Assigner des cartons au groupe "{selectedGroup?.name}"</DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Sélectionnez les cartons à assigner à ce groupe:</p>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {listCartons
                .filter(carton => !carton.groupId)
                .map(carton => (
                  <div key={carton.id} className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedCartons.includes(carton.id) ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'}`} onClick={() => handleCartonSelection(carton.id)}>
                    <div className="text-sm">
                      <div className="font-medium">Carton #{carton.cartonId}</div>
                      <div className="text-gray-300">
                        {carton.user?.nom} {carton.user?.prenom}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <Button onClick={() => setShowAssignDialog(false)} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (selectedCartons.length > 0) {
                    assignCartonsToGroup(selectedCartons, selectedGroup.id);
                    setSelectedCartons([]);
                    setShowAssignDialog(false);
                  }
                }}
                className="bg-green-700 hover:bg-green-800"
                disabled={selectedCartons.length === 0}
              >
                Assigner ({selectedCartons.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
