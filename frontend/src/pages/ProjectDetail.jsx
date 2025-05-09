
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import DataVisualizer from '@/components/DataVisualizer';
import ActivityLog from '@/components/ActivityLog';
import { 
  updateProject, 
  addDataToProject, 
  addVisualizationToProject, 
  addCollaboratorToProject, 
  getUsers 
} from '@/lib/data-service';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Users, 
  BarChart2, 
  Clock, 
  Edit, 
  Loader2 
} from 'lucide-react';

const ProjectDetail = ({ project, onBack }) => {
  const { toast } = useToast();
  const [currentProject, setCurrentProject] = useState(project);
  const [activeTab, setActiveTab] = useState('data');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [editedDescription, setEditedDescription] = useState(project.description || '');
  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Gérer le chargement des données
  const handleDataLoaded = (data) => {
    try {
      const updatedProject = addDataToProject(currentProject.id, data);
      setCurrentProject(updatedProject);
      
      toast({
        title: "Données importées",
        description: `${data.length} lignes ont été importées avec succès`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'importer les données",
      });
    }
  };
  
  // Gérer la sauvegarde d'une visualisation
  const handleSaveVisualization = (visualization) => {
    try {
      const updatedProject = addVisualizationToProject(currentProject.id, visualization);
      setCurrentProject(updatedProject);
      
      toast({
        title: "Visualisation enregistrée",
        description: `La visualisation "${visualization.name}" a été enregistrée`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer la visualisation",
      });
    }
  };
  
  // Gérer la mise à jour du projet
  const handleUpdateProject = async () => {
    if (!editedName.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom du projet est requis",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedProject = updateProject(currentProject.id, {
        name: editedName,
        description: editedDescription,
      });
      
      setCurrentProject(updatedProject);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Projet mis à jour",
        description: "Les informations du projet ont été mises à jour",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le projet",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer l'ajout d'un collaborateur
  const handleAddCollaborator = async () => {
    if (!collaboratorEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'email du collaborateur est requis",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Trouver l'utilisateur par email
      const users = getUsers();
      const user = users.find(user => user.email === collaboratorEmail);
      
      if (!user) {
        throw new Error("Aucun utilisateur trouvé avec cet email");
      }
      
      const updatedProject = addCollaboratorToProject(currentProject.id, user.id);
      setCurrentProject(updatedProject);
      setIsCollaboratorDialogOpen(false);
      setCollaboratorEmail('');
      
      toast({
        title: "Collaborateur ajouté",
        description: `${user.name} a été ajouté comme collaborateur`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le collaborateur",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{currentProject.name}</h1>
            <p className="text-muted-foreground">
              {currentProject.description || "Aucune description"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsCollaboratorDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            Collaborateurs
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="data" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            <span className="hidden md:inline">Données</span>
          </TabsTrigger>
          <TabsTrigger value="visualize" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden md:inline">Visualiser</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            <span className="hidden md:inline">Enregistrées</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">Activité</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FileUploader onDataLoaded={handleDataLoaded} />
              </motion.div>
            </div>
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DataTable data={currentProject.data} />
              </motion.div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="visualize">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DataVisualizer 
              data={currentProject.data} 
              onSaveVisualization={handleSaveVisualization} 
            />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="saved">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentProject.visualizations.length === 0 ? (
              <div className="text-center py-12">
                <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune visualisation enregistrée</h3>
                <p className="text-muted-foreground mb-4">
                  Créez et enregistrez des visualisations dans l'onglet "Visualiser"
                </p>
                <Button onClick={() => setActiveTab('visualize')}>
                  Créer une visualisation
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentProject.visualizations.map((visualization, index) => (
                  <motion.div
                    key={visualization.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-muted/30">
                        <h3 className="font-medium">{visualization.name}</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Type: {visualization.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Axe X: {visualization.config.xAxis}, 
                          Axe Y: {visualization.config.yAxis.join(', ')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="activity">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ActivityLog projectId={currentProject.id} />
          </motion.div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du projet</Label>
              <Input
                id="edit-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateProject} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCollaboratorDialogOpen} onOpenChange={setIsCollaboratorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un collaborateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collaborator-email">Email du collaborateur</Label>
              <Input
                id="collaborator-email"
                type="email"
                placeholder="email@exemple.com"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
              />
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Collaborateurs actuels</h4>
              {currentProject.collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun collaborateur</p>
              ) : (
                <ul className="space-y-1">
                  {currentProject.collaborators.map((collaboratorId) => (
                    <li key={collaboratorId} className="text-sm">
                      ID: {collaboratorId}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollaboratorDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCollaborator} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
