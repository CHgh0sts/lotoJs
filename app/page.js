'use client'
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
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
    if (e.target.innerText === 'Rejoindre') {
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center flex-col font-[family-name:var(--font-geist-sans)] relative overflow-hidden px-4">
      <div className="gridAnim"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl">
            LotoJs
          </h1>
          <p className="text-white/60 text-lg md:text-xl">
            Votre plateforme de loto moderne
          </p>
        </div>

        {/* Action buttons */}
        <div className="actionButton space-y-4">
          <button 
            className={`JoinGame bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border border-white/20 shadow-xl ${!isJoinInputVisible ? 'selected' : ''}`} 
            onClick={handleJoinButtonClick}
          >
            Rejoindre une partie
            <div className='arrow ml-2'>
              <ArrowUpRight />
            </div>
          </button>
          
          <input 
            type="text" 
            id="joinInput" 
            value={joinInputValue || ''} 
            onChange={handleJoinInputValue} 
            placeholder="Code de la partie" 
            className={`JoinGame bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 ${isJoinInputVisible ? 'selected' : ''}`} 
          />
          
          <button 
            onClick={(e) => handleJoinGame(e)} 
            className={`createGame bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border border-white/20 shadow-xl ${isJoinInputVisible ? 'valid' : ''}`}
          >
            {!isJoinInputVisible ? 'Créer une partie' : 'Rejoindre'}
            <div className='arrow ml-2'>
              <ArrowUpRight />
            </div>
          </button>
        </div>

        {/* Info text */}
        <div className="space-y-4">
          {!isJoinInputVisible ? (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <p className='text-white/70 text-sm'>
                💡 Pour créer une partie, vous devez être connecté
              </p>
            </div>
          ) : (
            <button 
              className='text-white/80 hover:text-white transition-colors duration-300 underline underline-offset-4' 
              onClick={handleBackButtonClick}
            >
              ← Retour
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 right-4 text-white/40 text-xs rotate-0 md:rotate-90 md:right-2 md:bottom-1/2 md:translate-y-1/2 md:origin-bottom-right">
        <p className="whitespace-nowrap">@CHghosts | 2025 - Tous droits réservés</p>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}
