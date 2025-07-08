'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GlobalContext } from '@/lib/GlobalState';
import { Trophy, Users, Grid, Target, TrendingUp, Calendar } from 'lucide-react';

export default function StatsDialog({ isOpen, onClose, gameId, gameSession }) {
  const { listCartons, numbers, listUsers, me } = useContext(GlobalContext);
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && gameSession) {
      fetchGameStats();
    }
  }, [isOpen, gameSession]);

  const fetchGameStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/game/${gameSession}`);
      const data = await response.json();
      setGameStats(data.game);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCartonProgress = carton => {
    const cleanedNumbers = carton.listNumber.filter(num => num !== '*').map(num => parseInt(num));
    const markedNumbers = cleanedNumbers.filter(num => numbers.includes(num));
    return {
      total: cleanedNumbers.length,
      marked: markedNumbers.length,
      percentage: Math.round((markedNumbers.length / cleanedNumbers.length) * 100)
    };
  };

  const calculateLineProgress = carton => {
    const cleanedNumbers = carton.listNumber.filter(num => num !== '*').map(num => parseInt(num));
    const subArrays = [];
    for (let i = 0; i < cleanedNumbers.length; i += 5) {
      subArrays.push(cleanedNumbers.slice(i, i + 5));
    }

    const completedLines = subArrays.filter(line => line.every(num => numbers.includes(num))).length;

    return {
      completed: completedLines,
      total: subArrays.length
    };
  };

  const getTopPerformers = () => {
    return listCartons
      .map(carton => ({
        ...carton,
        progress: calculateCartonProgress(carton),
        lines: calculateLineProgress(carton)
      }))
      .sort((a, b) => b.progress.percentage - a.progress.percentage)
      .slice(0, 5);
  };

  const getGameOverview = () => {
    const totalCartons = listCartons.length;
    const totalUsers = listUsers.length;
    const totalNumbers = numbers.length;
    const avgProgress =
      listCartons.reduce((sum, carton) => {
        return sum + calculateCartonProgress(carton).percentage;
      }, 0) / totalCartons || 0;

    return {
      totalCartons,
      totalUsers,
      totalNumbers,
      avgProgress: Math.round(avgProgress)
    };
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistiques du jeu
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Chargement des statistiques...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const overview = getGameOverview();
  const topPerformers = getTopPerformers();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistiques du jeu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vue d'ensemble */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Grid className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{overview.totalCartons}</div>
                <div className="text-sm text-muted-foreground">Cartons</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{overview.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Joueurs</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{overview.totalNumbers}</div>
                <div className="text-sm text-muted-foreground">Numéros tirés</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{overview.avgProgress}%</div>
                <div className="text-sm text-muted-foreground">Progression moy.</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Top performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top 5 - Meilleurs cartons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((carton, index) => (
                  <div key={carton.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">
                          {carton.user.nom} {carton.user.prenom}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Carton #{carton.id}
                          {carton.group && <span className="ml-2 text-blue-600">• {carton.group.name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{carton.progress.percentage}%</div>
                      <div className="text-sm text-muted-foreground">
                        {carton.progress.marked}/{carton.progress.total} numéros
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {carton.lines.completed} ligne{carton.lines.completed > 1 ? 's' : ''} complète{carton.lines.completed > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informations sur la partie actuelle */}
          {gameStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informations de la partie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Jeu</h4>
                    <p className="text-sm text-muted-foreground">ID: {gameStats.gameId}</p>
                    <p className="text-sm text-muted-foreground">Créé le: {new Date(gameStats.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Partie actuelle</h4>
                    {gameStats.Party && gameStats.Party.length > 0 && (
                      <>
                        <p className="text-sm text-muted-foreground">Partie #{gameStats.Party[gameStats.Party.length - 1].id}</p>
                        <p className="text-sm text-muted-foreground">Type: {gameStats.Party[gameStats.Party.length - 1].typePartyId === 1 ? 'Une ligne' : gameStats.Party[gameStats.Party.length - 1].typePartyId === 2 ? 'Deux lignes' : 'Carton plein'}</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progression détaillée de mon carton */}
          {me && (
            <Card>
              <CardHeader>
                <CardTitle>Mes cartons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {listCartons
                    .filter(carton => carton.userId === me.id)
                    .map(carton => {
                      const progress = calculateCartonProgress(carton);
                      const lines = calculateLineProgress(carton);
                      return (
                        <div key={carton.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">Carton #{carton.id}</div>
                            <Badge variant="outline">{progress.percentage}%</Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mb-2">
                            <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress.percentage}%` }} />
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              {progress.marked}/{progress.total} numéros marqués
                            </span>
                            <span>
                              {lines.completed} ligne{lines.completed > 1 ? 's' : ''} complète{lines.completed > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
