'use client';
import { GlobalContext } from '@/lib/GlobalState';
import { useContext, useState, useEffect } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

export default function Carton({ cartonInitial = { listNumber: Array(27).fill('*') }, height = '8vh', mode = 'view', addCartonInit = false, onAddCarton, onDelete, onEdit }) {
  const { numbers } = useContext(GlobalContext);
  const [carton, setCarton] = useState(cartonInitial);
  const [tempInputs, setTempInputs] = useState({});

  const isValidNumber = (value, j) => {
    if (!value || value === '*') return true;
    const num = parseInt(value);
    const min = j === 0 ? 1 : j * 10;
    const max = j === 8 ? 90 : (j + 1) * 10 - 1;
    return num >= min && num <= max;
  };

  const countNumbersInRow = (carton, i) => carton.listNumber.slice(i * 9, (i + 1) * 9).filter(num => num !== '*').length;

  const handleChange = (e, i, j) => {
    const value = e.target.value;
    setTempInputs(prev => ({ ...prev, [`${i}-${j}`]: value }));
  };

  const handleBlur = (e, i, j) => {
    const value = e.target.value.trim();
    if (!isNaN(value) && value !== '') {
      if (isValidNumber(value, j)) {
        const currentCount = countNumbersInRow(carton, i);
        if (currentCount >= 5 && carton.listNumber[i * 9 + j] === '*') {
          setCarton(cart => {
            const newCart = { ...cart };
            newCart.listNumber[i * 9 + j] = '*';
            return newCart;
          });
        } else {
          setCarton(cart => {
            const newCart = { ...cart };
            newCart.listNumber[i * 9 + j] = value;
            return newCart;
          });
        }
      } else {
        setCarton(cart => {
          const newCart = { ...cart };
          newCart.listNumber[i * 9 + j] = '*';
          return newCart;
        });
      }
    } else {
      setCarton(cart => {
        const newCart = { ...cart };
        newCart.listNumber[i * 9 + j] = '*';
        return newCart;
      });
    }
    setTempInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[`${i}-${j}`];
      return newInputs;
    });
  };

  const handleDelete = () => {
    onDelete && onDelete(carton);
  };

  useEffect(() => {
    if (addCartonInit) {
      const totalNumbers = carton.listNumber.filter(num => !isNaN(num) && num !== '*').length;
      if (totalNumbers === 15) {
        onAddCarton(carton.listNumber);
      }
    }
  }, [addCartonInit, carton.listNumber, onAddCarton]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="Carton" style={{ '--height': height }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="Carton-row">
              {[...Array(9)].map((_, j) => {
                const number = parseInt(carton.listNumber[i * 9 + j] || '*');
                const isSelected = numbers.includes(number);
                const tempValue = tempInputs[`${i}-${j}`];
                return (
                  <div key={`${i}-${j}`} className={`Carton-cell ${carton.listNumber[i * 9 + j] === '*' ? 'vide' : ''}`}>
                    {mode === 'create' ? <input onChange={e => handleChange(e, i, j)} onBlur={e => handleBlur(e, i, j)} type="text" className="w-full h-full bg-transparent text-white text-center" pattern="\d*" value={tempValue !== undefined ? tempValue : carton.listNumber[i * 9 + j] === '*' ? '' : carton.listNumber[i * 9 + j]} /> : <p className={`${isSelected ? 'isSelected' : ''}`}>{number ? number : ''}</p>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem className="flex items-center cursor-pointer" onClick={() => onEdit && onEdit(carton)}>
          <span>Modifier</span>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-800 focus:text-white" onClick={handleDelete}>
          <span>Supprimer</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
