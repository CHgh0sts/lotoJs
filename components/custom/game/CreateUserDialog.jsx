'use client';

import { useState, useContext } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GlobalContext } from '@/lib/GlobalState';
import { socket } from '@/lib/socketClient';
export default function CreateUserDialog({ isOpen, onClose, gameId }) {
  const { listUsers, setListUsers } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // D'abord créer l'utilisateur
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (userResponse.ok) {
        const newUser = await userResponse.json();

        // Ensuite l'associer à la partie via CreateLink
        const linkResponse = await fetch('/api/game/createLink', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: newUser.id,
            roleId: 3, // Role "View" par défaut
            gameId: gameId
          })
        });

        if (linkResponse.ok) {
          toast.success('Utilisateur créé et ajouté à la partie avec succès');
          const updatedUsers = [...listUsers, newUser];
          setListUsers(updatedUsers);
          socket.emit('updateListUsers', { listUsers: updatedUsers, gameId: gameId });
          onClose();
        } else {
          toast.error("Erreur lors de l'ajout de l'utilisateur à la partie");
        }
      } else {
        toast.error("Erreur lors de la création de l'utilisateur");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la création de l'utilisateur");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[fit-content] w-[500px] p-4">
        <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="nom" className="text-sm">
              Nom
            </label>
            <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} className="border border-gray-300 rounded-md p-2 bg-transparent text-white" placeholder="Nom du nouvel utilisateur" required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="prenom" className="text-sm">
              Prénom
            </label>
            <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} className="border border-gray-300 rounded-md p-2 bg-transparent text-white" placeholder="Prénom du nouvel utilisateur" required />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md">
              Annuler
            </button>
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
              Créer
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
