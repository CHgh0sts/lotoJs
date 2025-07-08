'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, ArrowRight, Home } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation d'une connexion
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 1500);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="gridAnim"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Back button */}
      <button onClick={handleBackHome} className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 z-10" title="Retour à l'accueil">
        <Home className="w-5 h-5" />
      </button>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Connexion</CardTitle>
            <CardDescription className="text-white/70">Connectez-vous pour accéder à votre compte LotoJs</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <Input id="email" name="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={handleInputChange} className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:bg-white/15" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:bg-white/15" required />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connexion...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Se connecter
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-transparent px-2 text-white/60">ou</span>
                </div>
              </div>

              <div className="text-sm text-white/70">
                <p>Pas encore de compte ?</p>
                <button className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors duration-200">Créer un compte</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info card */}
        <div className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
          <p className="text-white/70 text-sm">💡 Version de démonstration - La connexion est simulée</p>
        </div>
      </div>
    </div>
  );
}
