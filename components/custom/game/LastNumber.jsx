'use client';
import { GlobalContext } from '@/lib/GlobalState';
import { useContext } from 'react';

export default function LastNumber() {
  const { numbers } = useContext(GlobalContext);
  return (
    <div className="flex items-center justify-center flex-col w-full max-w-[90vw] sm:max-w-[70vw] md:max-w-[50vh] lg:max-w-[60vh] h-24 sm:h-28 md:h-32 lg:h-36 border-2 border-gray-800 rounded-lg bg-black/20 backdrop-blur-sm">
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-white/80 mb-1">Dernier numéro :</h3>
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">{numbers.length > 0 ? numbers[numbers.length - 1] : '0'}</h2>
    </div>
  );
}
