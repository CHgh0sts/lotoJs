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
      router.push('/create');
    }
  };
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center flex-col font-[family-name:var(--font-geist-sans)]">
      <div className="gridAnim"></div>
      <h1 className="relative text-[10vh]">LotoJs</h1>
      <div className="actionButton">
      <button className={`JoinGame m-2 p-3 rounded-xl bg-black text-white ${!isJoinInputVisible ? 'selected' : ''}`} onClick={handleJoinButtonClick}>
          Rejoindre une instance
          <div className='arrow'>
            <ArrowUpRight />
          </div>
        </button>
        <input type="text" id="joinInput" value={joinInputValue || ''} onChange={handleJoinInputValue} placeholder={`Entrez le code de la partie`} className={`m-2 p-3 rounded-xl bg-black outline-none text-white JoinGame ${isJoinInputVisible ? 'selected' : ''}`} />
        <button onClick={(e) => handleJoinGame(e)} className={`m-2 p-3 rounded-xl bg-white text-black createGame ${isJoinInputVisible ? 'valid' : ''}`}>
          {!isJoinInputVisible ? 'Créée une instance' : 'Rejoindre'}
          <div className='arrow'>
            <ArrowUpRight />
          </div>
        </button>
      </div>
      {!isJoinInputVisible
        ? <p className='relative opacity-50 mb-5'>Pour créer une instance il faut etre connecté</p>
        : <button className='text-white' onClick={handleBackButtonClick}>Retour</button>
      }
      <p className='footer' style={{ writingMode: 'vertical-rl', position: 'absolute', right: '0', rotate: '180deg' }}>@CHghosts | 2025 - Tout drois reservé</p>
    </div>
  );
}
