import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement authentication logic
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement signup logic
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-slate-950 items-center justify-center p-12 relative">
        <div className="text-center space-y-8 max-w-md">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <path d="M8 4 L20 4 L28 12 L20 20 L8 20 L16 12 Z" fill="#10B981" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white">
              Trade<span className="text-emerald-500">Map</span>
            </h1>
            <p className="text-lg text-gray-400 font-light tracking-wide">
              as a lifestyle
            </p>
          </div>
        </div>
        
        {/* Valemobi no canto inferior */}
        <div className="absolute bottom-12 left-12">
          <p className="text-gray-400 text-sm">Valemobi</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8 bg-slate-900">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="flex flex-col items-center justify-center space-y-3">
              <h1 className="text-2xl font-bold text-white">
                Trade<span className="text-emerald-500">Map</span>
              </h1>
              <p className="text-gray-400 text-sm">as a lifestyle</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-white">Entre ou crie sua conta</h2>
            </div>

            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">E-mail, CPF ou celular</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="793.357.483-15"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <div className="text-right">
                  <button 
                    type="button"
                    className="text-sm text-emerald-400 hover:underline"
                  >
                    Esqueci a senha
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0" 
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isSignUp ? "Criando conta..." : "Entrando...")
                    : (isSignUp ? "Criar uma conta" : "Entrar na minha conta")
                  }
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Já tenho uma conta" : "Criar uma conta"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-gray-400">Ou entre com:</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-white"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;