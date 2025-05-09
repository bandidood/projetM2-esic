
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detectDataTypes } from '@/lib/data-parser';
import { motion } from 'framer-motion';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FF6B6B', '#6B66FF', '#FFD166', '#06D6A0'
];

const DataVisualizer = ({ data, onSaveVisualization }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxisField, setXAxisField] = useState('');
  const [yAxisFields, setYAxisFields] = useState([]);
  const [chartTitle, setChartTitle] = useState('');
  
  // Si aucune donnée n'est fournie, afficher un message
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Aucune donnée à visualiser</p>
      </div>
    );
  }
  
  // Détecter les types de données
  const dataTypes = detectDataTypes(data);
  
  // Obtenir les colonnes numériques et non numériques
  const numericFields = Object.entries(dataTypes)
    .filter(([_, type]) => type === 'number')
    .map(([field]) => field);
  
  const nonNumericFields = Object.entries(dataTypes)
    .filter(([_, type]) => type !== 'number')
    .map(([field]) => field);
  
  // Définir les champs par défaut si non définis
  if (!xAxisField && nonNumericFields.length > 0) {
    setXAxisField(nonNumericFields[0]);
  }
  
  if (yAxisFields.length === 0 && numericFields.length > 0) {
    setYAxisFields([numericFields[0]]);
  }
  
  // Gérer l'ajout d'un champ Y
  const handleAddYField = () => {
    const availableFields = numericFields.filter(field => !yAxisFields.includes(field));
    if (availableFields.length > 0) {
      setYAxisFields([...yAxisFields, availableFields[0]]);
    }
  };
  
  // Gérer la suppression d'un champ Y
  const handleRemoveYField = (field) => {
    setYAxisFields(yAxisFields.filter(f => f !== field));
  };
  
  // Gérer le changement d'un champ Y
  const handleChangeYField = (index, value) => {
    const newYAxisFields = [...yAxisFields];
    newYAxisFields[index] = value;
    setYAxisFields(newYAxisFields);
  };
  
  // Gérer la sauvegarde de la visualisation
  const handleSave = () => {
    if (onSaveVisualization) {
      onSaveVisualization({
        name: chartTitle || `Visualisation ${chartType}`,
        type: chartType,
        config: {
          xAxis: xAxisField,
          yAxis: yAxisFields
        }
      });
    }
  };
  
  // Rendu du graphique en fonction du type
  const renderChart = () => {
    if (!xAxisField || yAxisFields.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Veuillez sélectionner les champs à visualiser</p>
        </div>
      );
    }
    
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisField} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yAxisFields.map((field, index) => (
                <Line 
                  key={field} 
                  type="monotone" 
                  dataKey={field} 
                  stroke={COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisField} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yAxisFields.map((field, index) => (
                <Bar 
                  key={field} 
                  dataKey={field} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        // Pour le graphique en camembert, nous utilisons uniquement le premier champ Y
        const pieData = data.map(item => ({
          name: item[xAxisField],
          value: item[yAxisFields[0]]
        }));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Configuration de la visualisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="chart-title">Titre du graphique</Label>
                <input
                  id="chart-title"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="Titre du graphique"
                />
              </div>
              
              <div>
                <Label htmlFor="chart-type">Type de graphique</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger id="chart-type" className="mt-1">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Diagramme à barres</SelectItem>
                    <SelectItem value="line">Graphique linéaire</SelectItem>
                    <SelectItem value="pie">Diagramme circulaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="x-axis">Axe X</Label>
                <Select value={xAxisField} onValueChange={setXAxisField}>
                  <SelectTrigger id="x-axis" className="mt-1">
                    <SelectValue placeholder="Sélectionner un champ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(data[0]).map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Axe Y (Valeurs)</Label>
              {yAxisFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select 
                    value={field} 
                    onValueChange={(value) => handleChangeYField(index, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un champ" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericFields.map(field => (
                        <SelectItem key={field} value={field}>{field}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {yAxisFields.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveYField(field)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              ))}
              
              {yAxisFields.length < numericFields.length && chartType !== 'pie' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddYField}
                >
                  Ajouter un champ
                </Button>
              )}
              
              <Button 
                className="w-full mt-4" 
                onClick={handleSave}
              >
                Enregistrer la visualisation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{chartTitle || 'Aperçu de la visualisation'}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataVisualizer;
