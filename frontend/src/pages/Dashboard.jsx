
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ProjectCard from '@/components/ProjectCard';
import { getProjects, createProject, deleteProject, getCurrentUser } from '@/lib/data-service';
import { motion } from 'framer-motion';
import { Plus, Search, Database, Loader2 } from 'lucide-react';

const Dashboard = ({ onProjectSelect }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Récupérer les projets au chargement
  useEffect(() => {
    const loadProjects = () => {
      setIsLoading(true);
      try {
        const userProjects = getProjects();
        setProjects(userProjects);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les projets",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, [toast]);
  
  // Filtrer les projets en fonction du terme de recherche
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Créer un nouveau projet
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom du projet est requis",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newProject = createProject({
        name: newProjectName,
        description: newProjectDescription,
      });
      
      setProjects([...projects, newProject]);
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      
      toast({
        title: "Projet créé",
        description: `Le projet "${newProject.name}" a été créé avec succès`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer le projet",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Supprimer un projet
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      
      setProjects(projects.filter(project => project.id !== projectId));
      
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer le projet",
      });
    }
  };
  
  // Vérifier si l'utilisateur est connecté
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vous n'êtes pas connecté</h2>
          <p className="text-muted-foreground mb-4">Veuillez vous connecter pour accéder au tableau de bord</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {currentUser.name}. Gérez vos projets d'analyse de données.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un projet..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-64 text-center"
        >
          <Database className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-medium mb-2">Aucun projet trouvé</h2>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 
              "Aucun projet ne correspond à votre recherche" : 
              "Vous n'avez pas encore créé de projet"}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Créer un projet
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={onProjectSelect}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nom du projet</Label>
              <Input
                id="project-name"
                placeholder="Mon projet d'analyse"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (optionnelle)</Label>
              <Input
                id="project-description"
                placeholder="Description du projet"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateProject} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
