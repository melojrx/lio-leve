import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, Eye, EyeOff, TrendingUp } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="hidden lg:flex lg:flex-1 bg-card items-center justify-center p-12">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Investorion</h1>
          </div>
          <p className="text-xl text-muted-foreground font-light">
            Your wallet, total clarity
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Investorion</h1>
            </div>
            <p className="text-muted-foreground">Your wallet, total clarity</p>
          </div>

          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-foreground">Entre ou crie sua conta</h2>
              <p className="text-muted-foreground mt-2">Gerencie seus investimentos com inteligência</p>
            </div>

            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="login" className="data-[state=active]:bg-card">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-card">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-foreground">E-mail, CPF ou celular</Label>
                    <Input
                      id="login-email"
                      type="text"
                      placeholder="793.357.483-15"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-foreground">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background border-border focus:border-primary pr-10"
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
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="text-right">
                      <button 
                        type="button"
                        className="text-sm text-primary hover:underline"
                      >
                        Esqueci a senha
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? "Entrando..." : "Entrar na minha conta"}
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-border">
                      Criar uma conta
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Ou entre com:</span>
                    </div>
                  </div>
                  <Button type="button" variant="outline" className="w-full border-border">
                    <span className="mr-2">🇬</span>
                    Google
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">E-mail, CPF ou celular</Label>
                    <Input
                      id="signup-email"
                      type="text"
                      placeholder="793.357.483-15"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background border-border focus:border-primary pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? "Criando conta..." : "Criar uma conta"}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Ou cadastre-se com:</span>
                    </div>
                  </div>
                  <Button type="button" variant="outline" className="w-full border-border">
                    <span className="mr-2">🇬</span>
                    Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;