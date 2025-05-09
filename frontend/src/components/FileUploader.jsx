
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { parseCSV, parseJSON } from '@/lib/data-parser';
import { motion } from 'framer-motion';
import { Upload, FileText, FileSpreadsheet, FileJson, AlertCircle } from 'lucide-react';

const FileUploader = ({ onDataLoaded }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Gérer le glisser-déposer
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Gérer la sélection de fichier
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Traiter le fichier
  const handleFile = async (file) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    
    // Simuler une progression
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        return newProgress < 90 ? newProgress : prev;
      });
    }, 100);
    
    try {
      let data;
      
      // Déterminer le type de fichier
      if (file.name.endsWith('.csv')) {
        data = await parseCSV(file);
      } else if (file.name.endsWith('.json')) {
        data = await parseJSON(file);
      } else {
        throw new Error('Format de fichier non pris en charge. Veuillez utiliser CSV ou JSON.');
      }
      
      // Vérifier que les données sont valides
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée trouvée dans le fichier.');
      }
      
      // Arrêter la simulation de progression
      clearInterval(progressInterval);
      setProgress(100);
      
      // Notifier le succès
      toast({
        title: "Importation réussie",
        description: `${data.length} lignes importées depuis ${file.name}`,
      });
      
      // Appeler le callback avec les données
      if (onDataLoaded) {
        onDataLoaded(data);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(error.message);
      
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      
      // Réinitialiser l'input de fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".csv,.json"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Importer des données</h3>
            <p className="text-sm text-muted-foreground">
              Glissez-déposez un fichier CSV ou JSON ici, ou cliquez pour sélectionner un fichier
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Sélectionner un fichier
          </Button>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>CSV</span>
            </div>
            <div className="flex items-center">
              <FileJson className="mr-2 h-4 w-4" />
              <span>JSON</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {isLoading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Importation en cours...</span>
            <span className="text-sm">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 border border-destructive/50 rounded-md bg-destructive/10">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive">Erreur d'importation</h4>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="font-medium mb-2">Conseils pour l'importation</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>Les fichiers CSV doivent avoir une ligne d'en-tête</li>
          <li>Les fichiers JSON doivent contenir un tableau d'objets</li>
          <li>Taille maximale recommandée : 10 Mo</li>
          <li>Pour de meilleures performances, limitez le nombre de colonnes</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploader;
