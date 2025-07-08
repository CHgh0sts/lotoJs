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
      <header className="w-full px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">LotoJs</h1>
            <p className="text-gray-400 text-xs">Plateforme de loto moderne</p>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{user?.prenom} {user?.nom}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full h-full flex">
        {/* Left Section - Actions */}
        <div className="w-1/2 bg-gray-800 p-8 flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {!isJoinInputVisible ? 'Commencer à jouer' : 'Rejoindre une partie'}
              </h2>
              <p className="text-gray-400 text-lg">
                {!isJoinInputVisible 
                  ? 'Créez une nouvelle partie ou rejoignez une partie existante'
                  : 'Entrez le code de la partie pour vous connecter'
                }
              </p>
            </div>

            {!isJoinInputVisible ? (
              <div className="space-y-4">
                <button 
                  onClick={(e) => handleJoinGame(e)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 px-8 rounded-xl text-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Plus className="w-6 h-6" />
                  Créer une nouvelle partie
                </button>
                
                <button 
                  onClick={handleJoinButtonClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 rounded-xl text-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Play className="w-6 h-6" />
                  Rejoindre une partie
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={joinInputValue || ''} 
                  onChange={handleJoinInputValue} 
                  placeholder="Entrez le code de la partie..." 
                  className="w-full py-6 px-8 rounded-xl bg-gray-700 border-2 border-gray-600 text-white text-xl placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-600 transition-all"
                  autoFocus
                />
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleBackButtonClick}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all"
                  >
                    ← Retour
                  </button>
                  
                  <button 
                    onClick={(e) => handleJoinGame(e)}
                    disabled={!joinInputValue.trim()}
                    className="flex-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    Rejoindre maintenant
                  </button>
                </div>
              </div>
            )}

            {!isJoinInputVisible && (
              <div className={`${isAuthenticated() ? 'bg-green-900/30 border-green-700/50' : 'bg-blue-900/30 border-blue-700/50'} border rounded-xl p-6`}>
                <div className="flex items-start gap-3">
                  <div className={`${isAuthenticated() ? 'text-green-400' : 'text-blue-400'} text-2xl`}>
                    {isAuthenticated() ? '✓' : '💡'}
                  </div>
                  <div>
                    <h3 className={`${isAuthenticated() ? 'text-green-300' : 'text-blue-300'} font-semibold mb-2`}>
                      {isAuthenticated() ? 'Vous êtes connecté !' : 'Connexion requise'}
                    </h3>
                    <p className={`${isAuthenticated() ? 'text-green-200' : 'text-blue-200'} text-sm leading-relaxed`}>
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

        {/* Right Section - Visual */}
        <div className="w-1/2 bg-gray-900 p-8 flex flex-col justify-center items-center relative">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text">
                LOTO
              </div>
              <div className="text-2xl text-gray-300 font-light">
                Nouvelle génération
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-sm">
              {[12, 34, 56, 78, 90, 23, 45, 67, 89].map((number, index) => (
                <div 
                  key={index}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {number}
                </div>
              ))}
            </div>

            <div className="space-y-3 text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Interface moderne et intuitive</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Partie en temps réel</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Jusqu'à 50 joueurs</span>
              </div>
            </div>
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
