'use client';
import { GlobalContext } from '@/lib/GlobalState';
import { useContext } from 'react';

export default function LastNumber() {
  const { numbers } = useContext(GlobalContext);
  return (
    <div className="flex items-center justify-center flex-col w-[50vh] h-[15vh] border-2 border-gray-800 rounded-md">
      <h3 className="text-1xl font-bold">Dernier numéro :</h3>
      <h2 className="text-6xl font-bold">{numbers.length > 0 ? numbers[numbers.length - 1] : '0'}</h2>
    </div>
  );
}
