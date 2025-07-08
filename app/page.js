'use client'
import { ArrowUpRight, Play, Plus, LogOut, User, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [isJoinInputVisible, setJoinInputVisible] = useState(false);
  const [joinInputValue, setJoinInputValue] = useState('');
  
  const handleJoinButtonClick = () => {
    setJoinInputVisible(true);
  };
  
  const handleBackButtonClick = () => {
    setJoinInputVisible(false);
    setJoinInputValue('');
  };
  
  const handleJoinInputValue = (e) => {
    setJoinInputValue(e.target.value);
  };
  
  const handleJoinGame = (e) => {
    // Vérifier l'authentification avant de procéder
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (e.target.innerText.includes('Rejoindre')) {
      router.push(`/game/${joinInputValue}`);
    } else {
      fetch('/api/createGame', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(data => {
        router.push(`/game/${data.gameId}`);
      });
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">LotoJs</h1>
            <p className="text-gray-400 text-xs hidden sm:block">Plateforme de loto moderne</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated() ? (
              <>
                {/* User info */}
                <div className="hidden sm:flex items-center gap-3 text-white">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{user?.prenom} {user?.nom}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
                </div>
                {/* User info mobile */}
                <div className="sm:hidden text-white text-sm">
                  <p className="font-medium">{user?.prenom}</p>
                </div>
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* Login button */
              <button
                onClick={handleLogin}
                className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Se connecter</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full h-[calc(100vh-73px)] flex justify-center items-center">
        {/* Section principale - Actions */}
        <div className="w-full max-w-2xl bg-gray-800 p-4 sm:p-6 md:p-8 flex flex-col justify-center rounded-xl shadow-2xl mx-4">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
                {!isJoinInputVisible ? 'Commencer à jouer' : 'Rejoindre une partie'}
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                {!isJoinInputVisible 
                  ? 'Créez une nouvelle partie ou rejoignez une partie existante'
                  : 'Entrez le code de la partie pour vous connecter'
                }
              </p>
            </div>

            {!isJoinInputVisible ? (
              <div className="space-y-3 sm:space-y-4">
                <button 
                  onClick={(e) => handleJoinGame(e)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 sm:py-6 px-6 sm:px-8 rounded-xl text-lg sm:text-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-center">Créer une nouvelle partie</span>
                </button>
                
                <button 
                  onClick={handleJoinButtonClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 sm:py-6 px-6 sm:px-8 rounded-xl text-lg sm:text-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-center">Rejoindre une partie</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <input 
                  type="text" 
                  value={joinInputValue || ''} 
                  onChange={handleJoinInputValue} 
                  placeholder="Entrez le code de la partie..." 
                  className="w-full py-4 sm:py-6 px-6 sm:px-8 rounded-xl bg-gray-700 border-2 border-gray-600 text-white text-lg sm:text-xl placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-600 transition-all"
                  autoFocus
                />
                
                <div className="flex gap-3 sm:gap-4">
                  <button 
                    onClick={handleBackButtonClick}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all text-sm sm:text-base"
                  >
                    ← Retour
                  </button>
                  
                  <button 
                    onClick={(e) => handleJoinGame(e)}
                    disabled={!joinInputValue.trim()}
                    className="flex-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Rejoindre maintenant</span>
                    <span className="sm:hidden">Rejoindre</span>
                  </button>
                </div>
              </div>
            )}

            {!isJoinInputVisible && (
              <div className={`${isAuthenticated() ? 'bg-green-900/30 border-green-700/50' : 'bg-blue-900/30 border-blue-700/50'} border rounded-xl p-4 sm:p-6`}>
                <div className="flex items-start gap-3">
                  <div className={`${isAuthenticated() ? 'text-green-400' : 'text-blue-400'} text-xl sm:text-2xl`}>
                    {isAuthenticated() ? '✓' : '💡'}
                  </div>
                  <div>
                    <h3 className={`${isAuthenticated() ? 'text-green-300' : 'text-blue-300'} font-semibold mb-2 text-sm sm:text-base`}>
                      {isAuthenticated() ? 'Vous êtes connecté !' : 'Connexion requise'}
                    </h3>
                    <p className={`${isAuthenticated() ? 'text-green-200' : 'text-blue-200'} text-xs sm:text-sm leading-relaxed`}>
                      {isAuthenticated() 
                        ? `Bienvenue ${user?.prenom} ! Vous pouvez maintenant créer une nouvelle partie ou rejoindre une partie existante. Les parties peuvent accueillir jusqu'à 50 joueurs simultanément.`
                        : 'Pour créer ou rejoindre une partie, vous devez être connecté. Cliquez sur "Se connecter" en haut à droite ou sur un des boutons ci-dessus.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div>
            © 2025 LotoJs - Tous droits réservés
          </div>
          <div>
            Développé par @CHghosts
          </div>
        </div>
      </footer>
    </div>
  );
}
