
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Users, BarChart2, FileText } from 'lucide-react';

const ProjectCard = ({ project, onClick, onDelete }) => {
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {project.description || "Aucune description"}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Créé le {formatDate(project.createdAt)}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{project.collaborators.length} collaborateur(s)</span>
            </div>
            
            <div className="flex items-center text-sm">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{project.data.length} entrées de données</span>
            </div>
            
            <div className="flex items-center text-sm">
              <BarChart2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{project.visualizations.length} visualisation(s)</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="default" 
            onClick={() => onClick(project)}
          >
            Ouvrir
          </Button>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
          >
            Supprimer
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
