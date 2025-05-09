
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { loginUser, createUser, initDemoData } from '@/lib/data-service';
import { motion } from 'framer-motion';
import { Loader2, LogIn, UserPlus, Database } from 'lucide-react';

const Login = ({ onLogin }) => {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Gérer la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = loginUser(email, password);
      
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.name}`,
      });
      
      if (onLogin) {
        onLogin(user);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer l'inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = createUser({
        name,
        email,
        password,
        role: 'user'
      });
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
      
      // Connecter automatiquement l'utilisateur
      loginUser(email, password);
      
      if (onLogin) {
        onLogin(user);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Utiliser les données de démonstration
  const handleUseDemo = () => {
    try {
      const initialized = initDemoData();
      
      if (initialized) {
        toast({
          title: "Données de démonstration",
          description: "Les données de démonstration ont été initialisées",
        });
        
        if (onLogin) {
          onLogin();
        }
      } else {
        toast({
          title: "Information",
          description: "Les données de démonstration sont déjà initialisées",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'initialiser les données de démonstration",
      });
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg"
      >
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Database className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">DataCollab</h2>
          <p className="text-muted-foreground">
            Plateforme collaborative d'analyse de données
          </p>
        </div>
        
        <div className="flex justify-center space-x-2">
          <Button
            variant={isLogin ? "default" : "outline"}
            onClick={() => setIsLogin(true)}
            className="flex-1"
          >
            Connexion
          </Button>
          <Button
            variant={!isLogin ? "default" : "outline"}
            onClick={() => setIsLogin(false)}
            className="flex-1"
          >
            Inscription
          </Button>
        </div>
        
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                S'inscrire
              </>
            )}
          </Button>
        </form>
        
        <div className="pt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Vous voulez essayer l'application rapidement ?
          </p>
          <Button
            variant="outline"
            onClick={handleUseDemo}
            className="w-full"
          >
            Utiliser les données de démonstration
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
