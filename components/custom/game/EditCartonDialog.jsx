import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Carton from './Carton';
import { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import { toast } from 'sonner';

export default function EditCartonDialog({ isOpen, onClose, carton, onCartonUpdated }) {
  const [updateCarton, setUpdateCarton] = useState(false);
  const [updateCartonInit, setUpdateCartonInit] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('none');
  const [groups, setGroups] = useState([]);
  const [cartonStatus, setCartonStatus] = useState({ isValid: false, errors: [], totalNumbers: 0 });
  const [currentCarton, setCurrentCarton] = useState(carton);
  const { setListCartons } = useContext(GlobalContext);

  // Initialiser le carton et le groupe sélectionné
  useEffect(() => {
    if (carton) {
      setCurrentCarton(carton);
      setSelectedGroup(carton.groupId ? carton.groupId.toString() : 'none');
    }
  }, [carton]);

  // Charger les groupes disponibles
  useEffect(() => {
    if (isOpen && carton) {
      fetchGroups();
    }
  }, [isOpen, carton]);

  const fetchGroups = async () => {
    try {
      // Utiliser carton.gameId directement ou carton.game.gameId comme fallback
      const gameId = carton?.gameId || carton?.game?.gameId;

      if (!gameId) {
        console.log('Aucun gameId trouvé dans le carton, groupes désactivés');
        setGroups([]);
        return;
      }

      const response = await fetch(`/api/cartonGroups?gameId=${gameId}`);

      if (!response.ok) {
        console.log(`API cartonGroups non disponible (${response.status}), groupes désactivés`);
        setGroups([]);
        return;
      }

      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Groupes non disponibles, fonctionnalité désactivée');
      setGroups([]);
    }
  };

  const handleUpdateCarton = () => {
    setUpdateCartonInit(true);
  };

  useEffect(() => {
    async function updateCartonDB() {
      try {
        const value = {
          id: carton.id,
          ListNumber: updateCarton,
          groupId: selectedGroup === 'none' ? null : parseInt(selectedGroup)
        };
        console.log('Mise à jour carton:', value);

        const res = await fetch('/api/cartons/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(value)
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Carton mis à jour:', data);

          toast.success('Carton mis à jour avec succès');
          onClose();
          setSelectedGroup('none');

          // Appeler la fonction de callback si elle existe
          if (onCartonUpdated) {
            onCartonUpdated();
          }
        } else {
          const errorData = await res.json();
          console.error('Erreur lors de la mise à jour:', errorData);
          toast.error('Erreur lors de la mise à jour du carton');
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        toast.error('Erreur de connexion');
      }
    }

    if (updateCarton) {
      setUpdateCarton(false);
      setUpdateCartonInit(false);
      updateCartonDB();
    }
  }, [updateCarton, carton?.id, selectedGroup, onClose, onCartonUpdated]);

  if (!carton) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-fit bg-black max-w-[70vh]">
        <DialogTitle className="mt-2 ml-2 text-white">Éditer le carton #{carton.cartonId}</DialogTitle>

        {/* Sélection du groupe - Afficher seulement si des groupes sont disponibles */}
        {groups.length > 0 && (
          <div className="mx-2 mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">Groupe (optionnel)</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="none" className="text-white">
                  Aucun groupe
                </SelectItem>
                {groups
                  .filter(group => group.active)
                  .map(group => (
                    <SelectItem key={group.id} value={group.id.toString()} className="text-white">
                      {group.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Carton
          mode="create"
          cartonInitial={currentCarton}
          addCartonInit={updateCartonInit}
          onAddCarton={setUpdateCarton}
          onValidationError={errors => {
            errors.forEach(error => toast.error(error));
          }}
          onValidationChange={setCartonStatus}
        />

        {/* Indicateur de statut */}
        <div className="mx-2 mb-2 p-2 bg-gray-800 rounded text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300">Nombres saisis:</span>
            <span className={`font-bold ${cartonStatus.totalNumbers === 15 ? 'text-green-400' : 'text-yellow-400'}`}>{cartonStatus.totalNumbers}/15</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Statut:</span>
            <span className={`font-bold ${cartonStatus.isValid ? 'text-green-400' : 'text-red-400'}`}>{cartonStatus.isValid ? '✓ Valide' : '✗ Invalide'}</span>
          </div>
          {cartonStatus.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-400">
              <div className="font-semibold mb-1">Erreurs:</div>
              {cartonStatus.errors.slice(0, 3).map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
              {cartonStatus.errors.length > 3 && <div>• ... et {cartonStatus.errors.length - 3} autre(s)</div>}
            </div>
          )}
        </div>

        <button onClick={handleUpdateCarton} disabled={!cartonStatus.isValid} className={`m-2 text-center text-[1.4vh] text-white p-2 rounded-md transition-colors ${cartonStatus.isValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-600 cursor-not-allowed'}`}>
          {cartonStatus.isValid ? 'Mettre à jour le carton' : 'Carton invalide'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
