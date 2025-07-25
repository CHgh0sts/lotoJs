'use client';
import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import { socket } from '@/lib/socketClient';
import { Info } from 'lucide-react';
import Carton from './Carton';
const ListNumberBeforeWin = ({ typeParty }) => {
  const { listUsers, listCartons, numbers } = useContext(GlobalContext);
  const [listNumberBeforeWin, setListNumberBeforeWin] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => {
    const uniqueUsers = new Set();
    const updatedList = [];

    listUsers.forEach(user => {
      if (!uniqueUsers.has(user.id)) {
        uniqueUsers.add(user.id);
        const Cartons = listCartons.filter(carton => carton.user.id === user.id);
        let bestCarton = null;
        let minMissingNumbers = Infinity;

        Cartons.forEach(carton => {
          const cleanedNumbers = carton.listNumber.filter(num => num !== '*').map(num => parseInt(num));
          const subArrays = [];
          for (let i = 0; i < cleanedNumbers.length; i += 5) {
            subArrays.push(cleanedNumbers.slice(i, i + 5));
          }

          let missingNumbers = Infinity;

          if (typeParty === 1) {
            subArrays.forEach(subArray => {
              const missing = subArray.filter(num => !numbers.includes(num)).length;
              if (missing < missingNumbers) {
                missingNumbers = missing;
              }
            });
          } else if (typeParty === 2) {
            for (let i = 0; i < subArrays.length - 1; i++) {
              for (let j = i + 1; j < subArrays.length; j++) {
                const combinedArray = subArrays[i].concat(subArrays[j]);
                const missing = combinedArray.filter(num => !numbers.includes(num)).length;
                if (missing < missingNumbers) {
                  missingNumbers = missing;
                }
              }
            }
          } else if (typeParty === 3) {
            const combinedArray = subArrays.flat();
            const missing = combinedArray.filter(num => !numbers.includes(num)).length;
            if (missing < missingNumbers) {
              missingNumbers = missing;
            }
          }

          if (missingNumbers < minMissingNumbers) {
            minMissingNumbers = missingNumbers;
            bestCarton = carton;
          }
        });

        updatedList.push({ user, bestCarton, minMissingNumbers });
      }
    });

    setListNumberBeforeWin(updatedList);
  }, [numbers]);

  return (
    <div className="absolute bottom-0 left-0 m-2">
      <ul>
        {listNumberBeforeWin
          .filter(({ bestCarton }) => bestCarton !== null)
          .map(({ user, minMissingNumbers, bestCarton }, index) => (
            <li key={index} className="relative flex items-center gap-2">
              <Info className="w-4 h-4" onMouseEnter={() => setShowInfo(bestCarton)} onMouseLeave={() => setShowInfo(false)} />
              {showInfo && showInfo === bestCarton && (
                <div className="absolute pointer-events-none bottom-0 w-[35vh]">
                  <Carton cartonInitial={showInfo} />
                </div>
              )}
              {user.nom} {user.prenom} : {minMissingNumbers}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ListNumberBeforeWin;
