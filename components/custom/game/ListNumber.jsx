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
    <div className="relative w-full max-w-[50vh]">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="flex w-full justify-center">
          {Array.from({ length: 10 }, (_, j) => {
            const number = i * 10 + j + 1;
            const isLastNumber = number === numbers[numbers.length - 1];
            const isInNumbers = numbers.includes(number);
            return (
              <span onClick={() => handleNumberClick(number)} key={`${i}-${j}`} className={`w-[10%] aspect-square bg-black text-white flex items-center justify-center hover:bg-gray-500 cursor-pointer border-2 border-[#ffffff33] ${isLastNumber ? 'lastNumberSelect' : isInNumbers ? 'numberSelect' : ''}`} style={{ fontSize: 'clamp(0.75rem, 1.5vh, 1.5vh)' }}>
                {number}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ListNumber;
