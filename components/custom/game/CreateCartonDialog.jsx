import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Carton from './Carton';
import { useState, useEffect, useContext, useRef } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import ListNumber from './ListNumber';
import { toast } from 'sonner';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';

export default function CreateCartonDialog({ isOpen, onClose, params = { userId: '', gameId: '' }, onCartonCreated }) {
  const [addCarton, setAddCarton] = useState(false);
  const [addCartonInit, setAddCartonInit] = useState(false);
  const [cartonData, setCartonData] = useState({ listNumber: Array(27).fill('*') });
  const [selectedGroup, setSelectedGroup] = useState('none');
  const [groups, setGroups] = useState([]);
  const [cartonStatus, setCartonStatus] = useState({ isValid: false, errors: [], totalNumbers: 0 });
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [detectedNumbers, setDetectedNumbers] = useState([]);
  const fileInputRef = useRef(null);
  const { setListCartons } = useContext(GlobalContext);

  // Fonction pour vider complètement le dialog à la fermeture
  const handleClose = () => {
    setValidationState({ isValid: false, errors: [], totalNumbers: 0 });
    setCartonData({ listNumber: Array(27).fill('*') });
    setSelectedGroup('none');
    setDetectedNumbers([]);
    setIsProcessingOCR(false);
    onClose();
  };

  // Charger les groupes disponibles
  useEffect(() => {
    if (isOpen && params.gameId) {
      fetchGroups();
    }
  }, [isOpen, params.gameId]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`/api/cartonGroups?gameId=${params.gameId}`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    }
  };

  const handleAddCarton = () => {
    setAddCartonInit(true);
  };

  // Créer plusieurs versions prétraitées pour différents types d'images
  const createMultipleVersions = imageFile => {
    return new Promise(resolve => {
      const img = new Image();

      img.onload = () => {
        const versions = [];

        // Version 1: Image originale redimensionnée (pour photos nettes)
        const canvas1 = document.createElement('canvas');
        const ctx1 = canvas1.getContext('2d');
        const scale1 = Math.min(1200 / img.width, 900 / img.height);
        canvas1.width = img.width * scale1;
        canvas1.height = img.height * scale1;
        ctx1.drawImage(img, 0, 0, canvas1.width, canvas1.height);
        canvas1.toBlob(blob => {
          versions.push(blob);

          // Version 2: Contraste élevé (pour images floues/mal éclairées)
          const canvas2 = document.createElement('canvas');
          const ctx2 = canvas2.getContext('2d');
          canvas2.width = canvas1.width;
          canvas2.height = canvas1.height;
          ctx2.drawImage(canvas1, 0, 0);

          const imageData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
          const data2 = imageData2.data;

          for (let i = 0; i < data2.length; i += 4) {
            const r = data2[i];
            const g = data2[i + 1];
            const b = data2[i + 2];

            // Augmenter le contraste
            const luminance = r * 0.299 + g * 0.587 + b * 0.114;
            const threshold = luminance < 120 ? 0 : 255;

            data2[i] = threshold;
            data2[i + 1] = threshold;
            data2[i + 2] = threshold;
          }

          ctx2.putImageData(imageData2, 0, 0);
          canvas2.toBlob(blob => {
            versions.push(blob);

            // Version 3: Seuillage adaptatif (pour cartons colorés)
            const canvas3 = document.createElement('canvas');
            const ctx3 = canvas3.getContext('2d');
            canvas3.width = canvas1.width;
            canvas3.height = canvas1.height;
            ctx3.drawImage(canvas1, 0, 0);

            const imageData3 = ctx3.getImageData(0, 0, canvas3.width, canvas3.height);
            const data3 = imageData3.data;

            for (let i = 0; i < data3.length; i += 4) {
              const r = data3[i];
              const g = data3[i + 1];
              const b = data3[i + 2];

              // Détecter les zones colorées et les traiter différemment
              const luminance = r * 0.299 + g * 0.587 + b * 0.114;
              const isColorful = Math.abs(r - g) > 50 || Math.abs(g - b) > 50 || Math.abs(r - b) > 50;

              let threshold;
              if (isColorful) {
                // Pour zones colorées, seuil plus permissif
                threshold = luminance < 100 ? 0 : 255;
              } else {
                // Pour zones grises/blanches, seuil plus strict
                threshold = luminance < 80 ? 0 : 255;
              }

              data3[i] = threshold;
              data3[i + 1] = threshold;
              data3[i + 2] = threshold;
            }

            ctx3.putImageData(imageData3, 0, 0);
            canvas3.toBlob(blob => {
              versions.push(blob);
              resolve(versions);
            });
          });
        });
      };

      img.src = URL.createObjectURL(imageFile);
    });
  };

  // Fonction d'analyse d'image avec IA gratuite
  const processImageWithOCR = async imageFile => {
    setIsProcessingOCR(true);
    try {
      console.log("Début de l'analyse avec IA...");

      // Convertir l'image en base64
      const base64Image = await convertImageToBase64(imageFile);

      let detectedNumbers = [];

      // Utiliser notre API backend qui gère plusieurs services d'IA
      console.log("Analyse avec APIs d'IA multiples...");
      detectedNumbers = await analyzeImageWithAPI(base64Image);

      // Si échec, fallback vers OCR local
      if (detectedNumbers.length < 3) {
        console.log('Fallback vers OCR local...');
        detectedNumbers = await fallbackAdvancedOCR(imageFile);
      }

      console.log('Numéros finaux détectés:', detectedNumbers);

      if (detectedNumbers.length > 0) {
        setDetectedNumbers(detectedNumbers);

        // Auto-remplir si au moins 5 numéros
        if (detectedNumbers.length >= 5) {
          fillCartonWithNumbers(detectedNumbers);
        }
      } else {
        toast.error('Aucun numéro détecté. Essayez avec une image de meilleure qualité.');
      }
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      toast.error("Erreur lors de l'analyse de l'image");
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Convertir image en base64
  const convertImageToBase64 = imageFile => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };

  // Analyser l'image via notre API backend
  const analyzeImageWithAPI = async base64Image => {
    try {
      const response = await fetch('/api/analyzeImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base64Image: base64Image
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Résultat API:', result);

        // Afficher le message de qualité de l'API
        if (result.message) {
          if (result.quality === 'excellente') {
            toast.success(result.message);
          } else if (result.quality === 'bonne') {
            toast.success(result.message);
          } else if (result.quality === 'moyenne') {
            toast.warning(result.message);
          } else if (result.quality === 'faible') {
            toast.error(result.message);
          } else if (result.quality === 'erreur') {
            toast.error(result.message);
          }
        }

        if (result.success && result.numbers.length > 0) {
          return result.numbers;
        }
      }
    } catch (error) {
      console.log('Erreur API backend:', error);
      toast.error("❌ Erreur de connexion à l'API d'analyse");
    }

    return [];
  };

  // OCR avancé en fallback
  const fallbackAdvancedOCR = async imageFile => {
    try {
      const versions = await createMultipleVersions(imageFile);
      const worker = await createWorker('eng');
      const allNumbers = new Set();

      for (const version of versions) {
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789 ',
          tessedit_pageseg_mode: '6'
        });

        const {
          data: { text }
        } = await worker.recognize(version);
        const numbers = extractNumbersFromText(text);
        numbers.forEach(num => allNumbers.add(num));
      }

      await worker.terminate();
      return Array.from(allNumbers).sort((a, b) => a - b);
    } catch (error) {
      console.error('Erreur fallback OCR:', error);
      return [];
    }
  };

  // Extraire les numéros d'un texte
  const extractNumbersFromText = text => {
    const numbers = [];
    const matches = text.match(/\b\d{1,2}\b/g) || [];

    matches.forEach(match => {
      const num = parseInt(match);
      if (num >= 1 && num <= 90) {
        numbers.push(num);
      }
    });

    return [...new Set(numbers)].sort((a, b) => a - b);
  };

  // Fonction pour remplir le carton avec les numéros détectés
  const fillCartonWithNumbers = numbers => {
    // Créer un tableau de 27 cases (3x9) initialisé avec '*'
    const cartonArray = Array(27).fill('*');

    // Organiser les numéros par colonnes selon les règles du loto
    const organizedNumbers = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: []
    };

    // Répartir les numéros dans les bonnes colonnes
    numbers.forEach(num => {
      let column;
      if (num >= 1 && num <= 9) column = 0;
      else if (num >= 10 && num <= 19) column = 1;
      else if (num >= 20 && num <= 29) column = 2;
      else if (num >= 30 && num <= 39) column = 3;
      else if (num >= 40 && num <= 49) column = 4;
      else if (num >= 50 && num <= 59) column = 5;
      else if (num >= 60 && num <= 69) column = 6;
      else if (num >= 70 && num <= 79) column = 7;
      else if (num >= 80 && num <= 90) column = 8;

      if (column !== undefined) {
        organizedNumbers[column].push(num);
      }
    });

    // Placer les numéros dans le carton (5 par ligne)
    let numbersPlaced = 0;
    for (let row = 0; row < 3 && numbersPlaced < 15; row++) {
      let numbersInRow = 0;
      for (let col = 0; col < 9 && numbersInRow < 5 && numbersPlaced < 15; col++) {
        if (organizedNumbers[col].length > 0) {
          cartonArray[row * 9 + col] = organizedNumbers[col].shift().toString();
          numbersInRow++;
          numbersPlaced++;
        }
      }
    }

    // Déclencher la mise à jour du carton
    setCartonData({ listNumber: cartonArray });
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageWithOCR(file);
    } else {
      toast.error('Veuillez sélectionner une image valide');
    }
  };

  // Gestion de la capture photo
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    async function addCartonDB() {
      try {
        const value = {
          ListNumber: addCarton,
          userId: params.userId,
          gameId: params.gameId,
          groupId: selectedGroup === 'none' ? null : parseInt(selectedGroup)
        };
        console.log(value);
        const res = await fetch('/api/cartons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(value)
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Carton créé:', data);

          // Ajouter le nouveau carton à la liste seulement s'il est actif
          // (pas de groupe ou groupe actif)
          const newCarton = data.carton;
          const shouldAddToActiveList = !newCarton.group || newCarton.group.active;

          if (shouldAddToActiveList) {
            setListCartons(prev => [...prev, newCarton]);
          }

          toast.success('Carton ajouté avec succès');
          onClose();
          setSelectedGroup('none'); // Reset selection

          // Appeler la fonction de callback si elle existe
          if (onCartonCreated) {
            onCartonCreated();
          }
        } else {
          const errorData = await res.json();
          console.error('Erreur lors de la création:', errorData);
          toast.error('Erreur lors de la création du carton');
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        toast.error('Erreur de connexion');
      }
    }

    if (addCarton) {
      setAddCarton(false);
      setAddCartonInit(false);
      addCartonDB();
    }
  }, [addCarton, params.userId, params.gameId, selectedGroup, setListCartons, onClose, onCartonCreated]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="h-fit bg-black max-w-[70vh]">
        <DialogTitle className="mt-2 ml-2 text-white">Ajouter un carton</DialogTitle>

        {/* Sélection du groupe */}
        <div className="mx-2 mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">Groupe (optionnel)</label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Sélectionner un groupe" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="none" className="text-white">
                Aucun groupe
              </SelectItem>
              {groups
                .filter(group => group.active) // Montrer seulement les groupes actifs
                .map(group => (
                  <SelectItem key={group.id} value={group.id.toString()} className="text-white">
                    {group.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Boutons de capture photo */}
        <div className="mx-2 mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Scanner un carton existant</label>
          <div className="flex gap-2">
            <button onClick={handleCameraCapture} disabled={isProcessingOCR} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
              {isProcessingOCR ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {isProcessingOCR ? 'Traitement...' : 'Prendre une photo'}
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={isProcessingOCR} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
              <Upload className="w-4 h-4" />
              Importer image
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
          {detectedNumbers.length > 0 && (
            <div className="mt-2 p-2 bg-blue-900/30 border border-blue-600/30 rounded text-xs text-blue-300">
              <div className="font-semibold mb-1">Numéros détectés:</div>
              <div className="flex flex-wrap gap-1">
                {detectedNumbers.map((num, index) => (
                  <span key={index} className="bg-blue-600/50 px-2 py-1 rounded">
                    {num}
                  </span>
                ))}
              </div>
              {detectedNumbers.length < 15 && <div className="mt-1 text-yellow-400">⚠️ Seulement {detectedNumbers.length}/15 numéros détectés</div>}
              {detectedNumbers.length > 0 && (
                <button onClick={() => fillCartonWithNumbers(detectedNumbers)} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Appliquer ces numéros au carton
                </button>
              )}
            </div>
          )}
        </div>

        <Carton
          cartonInitial={cartonData}
          mode="create"
          addCartonInit={addCartonInit}
          onAddCarton={setAddCarton}
          onValidationError={errors => {
            errors.forEach(error => toast.error(error));
          }}
          onValidationChange={setCartonStatus}
        />

        {/* Indicateur de statut */}
        <div className="mx-2 mb-2 p-2 bg-gray-800 rounded text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300">Nombres saisis:</span>
            <span className={`font-bold ${cartonStatus.totalNumbers === 15 ? 'text-green-400' : 'text-yellow-400'}`}>{cartonStatus.totalNumbers}/15</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Statut:</span>
            <span className={`font-bold ${cartonStatus.isValid ? 'text-green-400' : 'text-red-400'}`}>{cartonStatus.isValid ? '✓ Valide' : '✗ Invalide'}</span>
          </div>
          {cartonStatus.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-400">
              <div className="font-semibold mb-1">Erreurs:</div>
              {cartonStatus.errors.slice(0, 3).map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
              {cartonStatus.errors.length > 3 && <div>• ... et {cartonStatus.errors.length - 3} autre(s)</div>}
            </div>
          )}
        </div>

        <button onClick={handleAddCarton} disabled={!cartonStatus.isValid} className={`m-2 text-center text-[1.4vh] text-white p-2 rounded-md transition-colors ${cartonStatus.isValid ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-600 cursor-not-allowed'}`}>
          {cartonStatus.isValid ? 'Ajouter ce Carton' : 'Carton invalide'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
