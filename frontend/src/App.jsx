
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { getCurrentUser } from '@/lib/data-service';
import Header from '@/components/Header';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ProjectDetail from '@/pages/ProjectDetail';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);
  
  // Gérer la connexion
  const handleLogin = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };
  
  // Gérer la déconnexion
  const handleLogout = () => {
    setUser(null);
    setSelectedProject(null);
  };
  
  // Gérer la sélection d'un projet
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };
  
  // Gérer le retour au tableau de bord
  const handleBackToDashboard = () => {
    setSelectedProject(null);
  };
  
  // Afficher le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Rendu de l'application
  return (
    <div className="min-h-screen flex flex-col">
      {user && <Header onLogout={handleLogout} />}
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          ) : selectedProject ? (
            <motion.div
              key="project"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectDetail 
                project={selectedProject} 
                onBack={handleBackToDashboard} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard onProjectSelect={handleProjectSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Toaster />
    </div>
  );
};

export default App;
