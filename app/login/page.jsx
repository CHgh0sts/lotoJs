'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const { login, register, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const result = await register(formData.nom, formData.prenom, formData.email, formData.password);
        if (result.success) {
          toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
          setIsRegisterMode(false);
          setFormData({ email: formData.email, password: '', nom: '', prenom: '' });
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Connexion réussie !');
          router.push('/');
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackHome = () => {
    router.push('/');
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setFormData({ email: '', password: '', nom: '', prenom: '' });
  };

  // Afficher un loader pendant la vérification de session
  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Back button */}
      <button onClick={handleBackHome} className="absolute top-6 left-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
        ← Accueil
      </button>

      {/* Main content */}
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white">👤</div>
          <h1 className="text-2xl font-bold text-white mb-2">{isRegisterMode ? 'Inscription' : 'Connexion'}</h1>
          <p className="text-gray-400 text-sm">{isRegisterMode ? 'Créez votre compte pour accéder à LotoJs' : 'Connectez-vous pour accéder à votre compte LotoJs'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegisterMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Nom</label>
                <input name="nom" type="text" placeholder="Nom" value={formData.nom} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-600" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Prénom</label>
                <input name="prenom" type="text" placeholder="Prénom" value={formData.prenom} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-600" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input name="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-600" />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Mot de passe</label>
            <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-600" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors">
            {isLoading ? (isRegisterMode ? 'Inscription...' : 'Connexion...') : isRegisterMode ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-800 px-2 text-gray-400">ou</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">{isRegisterMode ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}</p>
            <button type="button" onClick={toggleMode} className="text-blue-400 hover:text-blue-300 underline text-sm">
              {isRegisterMode ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
