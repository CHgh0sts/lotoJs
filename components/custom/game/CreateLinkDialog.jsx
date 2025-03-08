import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useContext } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import { CopyIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
export default function CreateLinkDialog({ isOpen, onClose, gameId }) {
  const { listUsers } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    userId: '',
    roleId: ''
  });
  const [urlLink, setUrlLink] = useState(null);
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCreateLink = async () => {
    try {
      const response = await fetch(`/api/game/createLink`, {
        method: 'POST',
        body: JSON.stringify({ ...formData, gameId })
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`${process.env.NEXT_PUBLIC_SOCKET_URL}game/${data.newUserGame.userGameId}`);
        setUrlLink(`${process.env.NEXT_PUBLIC_SOCKET_URL}game/${data.newUserGame.userGameId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(urlLink);
    toast.success('Lien copié dans le presse-papiers');
  };
  const handleClose = () => {
    setUrlLink(null);
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[fit-content] h-[fit-content] min-w-[500px] min-h-[100px] p-2">
        {urlLink ? (
          <>
            <h2 className="mt-2">Lien pour rejoinde cette game</h2>
            <div className="flex gap-2 items-center justify-center">
              <p className="w-full bg-black text-white rounded-md p-2 border border-gray-800">{urlLink}</p>
              <button onClick={handleCopyLink} className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
                <CopyIcon className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleClose} className="bg-red-700 hover:bg-red-800 text-white flex items-center justify-center p-1 rounded-md">
              Fermer
            </button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Créer un lien</DialogTitle>
              <DialogDescription>Créez un lien pour partager la game.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <label htmlFor="userId">Utilisateur</label>
              <select name="userId" id="userId" className="w-full bg-black text-white rounded-md p-2 border border-gray-800" onChange={handleChange}>
                <option value="">Sélectionnez un utilisateur</option>
                {listUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nom} {user.prenom}
                  </option>
                ))}
              </select>
              <div className="flex flex-col gap-2">
                <label htmlFor="roleId">Droit de cette utilisateur</label>
                <select name="roleId" id="roleId" className="w-full bg-black text-white rounded-md p-2 border border-gray-800" onChange={handleChange}>
                  <option value="">Sélectionnez un droit</option>
                  <option value="1">Admin</option>
                  <option value="2">Edit</option>
                  <option value="3">View</option>
                </select>
              </div>
              <button onClick={handleCreateLink} className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md">
                Créer un lien
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
