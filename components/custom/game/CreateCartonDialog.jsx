import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Carton from './Carton';
import { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import ListNumber from './ListNumber';
import { toast } from 'sonner';
export default function CreateCartonDialog({ isOpen, onClose, params = { userId: '', gameId: '' } }) {
  const [addCarton, setAddCarton] = useState(false);
  const [addCartonInit, setAddCartonInit] = useState(false);
  const { setListCartons } = useContext(GlobalContext);
  const handleAddCarton = () => {
    setAddCartonInit(true);
  };
  useEffect(() => {
    async function addCartonDB() {
      const value = {
        ListNumber: addCarton,
        userId: params.userId,
        gameId: params.gameId
      };
      console.log(value);
      const res = await fetch('/api/cartons', {
        method: 'POST',
        body: JSON.stringify(value)
      });
      const data = await res.json();
      toast.success('Carton ajouté avec succès');
      setListCartons(prev => [...prev, data]);
      onClose();
    }
    if (addCarton) {
      setAddCarton(false);
      setAddCartonInit(false);
      addCartonDB();
    }
  }, [addCarton]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-fit bg-black max-w-[70vh]">
        <DialogTitle className="mt-2 ml-2">Ajouter un carton</DialogTitle>
        <Carton mode="create" addCartonInit={addCartonInit} onAddCarton={setAddCarton} />
        <button onClick={handleAddCarton} className="m-2 text-center text-[1.4vh] bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
          Ajouter ce Carton
        </button>
      </DialogContent>
    </Dialog>
  );
}
