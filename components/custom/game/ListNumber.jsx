'use client';
import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import { socket } from '@/lib/socketClient';

const ListNumber = ({ gameSession, gameId, party }) => {
  const { numbers, setNumbers, me } = useContext(GlobalContext);

  const handleNumberClick = number => {
    const updatedNumbers = numbers.includes(number) ? numbers.filter(n => n !== number) : [...numbers, number];
    setNumbers(updatedNumbers);
    socket.emit('updateNumber', { gameId: gameSession, data: updatedNumbers });

    async function updateParty() {
      const partyData = {
        partyId: party,
        gameId: gameId,
        listNumber: updatedNumbers
      };
      const response = await fetch(`/api/party`, {
        method: 'PUT',
        body: JSON.stringify(partyData)
      });
      const data = await response.json();
    }
    updateParty();
  };

  useEffect(() => {
    socket.on('userJoined', user => {
      console.log(`User ${user.prenom} ${user.nom} has joined the game`);
    });
    socket.on('numbersUpdated', data => {
      if (data && data.length > 0) setNumbers(data);
    });
    socket.on('numbersUpdated', setNumbers);
  }, []);

  useEffect(() => {
    socket.emit('joinGame', { gameId: gameSession, user: me });
  }, [me]);

  return (
    <div className="w-full max-w-full mx-auto bg-black/50 rounded-lg border border-white/20 p-2 sm:p-3 md:p-4">
      <div className="grid grid-cols-10 gap-px sm:gap-1 w-full">
        {Array.from({ length: 90 }, (_, index) => {
          const number = index + 1;
          const isLastNumber = number === numbers[numbers.length - 1];
          const isInNumbers = numbers.includes(number);

          return (
            <button
              onClick={() => handleNumberClick(number)}
              key={number}
              className={`
                aspect-square w-full
                flex items-center justify-center 
                border border-white/20 rounded-sm sm:rounded-md
                transition-all duration-200 ease-in-out
                text-white font-medium
                hover:bg-gray-500 hover:scale-105
                active:scale-95
                cursor-pointer
                text-xs sm:text-sm md:text-base lg:text-lg
                ${isLastNumber ? 'lastNumberSelect bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30 scale-110' : isInNumbers ? 'numberSelect bg-gradient-to-br from-yellow-500 to-yellow-600 text-black border-yellow-400 shadow-md shadow-yellow-500/20 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
              `}
            >
              {number}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ListNumber;
