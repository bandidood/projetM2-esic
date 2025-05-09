
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Download, 
  Filter, 
  SortAsc, 
  SortDesc 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const DataTable = ({ data, onFilterChange, onSortChange }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Si aucune donnée n'est fournie, afficher un message
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Aucune donnée à afficher</p>
      </div>
    );
  }

  // Obtenir les colonnes à partir des données
  const columns = Object.keys(data[0]);

  // Filtrer les données en fonction du terme de recherche
  const filteredData = data.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculer la pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gérer le tri
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Inverser la direction si la même colonne est cliquée
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      if (onSortChange) {
        onSortChange({ column, direction: newDirection });
      }
    } else {
      // Définir une nouvelle colonne de tri
      setSortColumn(column);
      setSortDirection('asc');
      if (onSortChange) {
        onSortChange({ column, direction: 'asc' });
      }
    }
  };

  // Exporter les données au format CSV
  const exportCSV = () => {
    const headers = columns.join(',');
    const rows = filteredData.map(row => 
      columns.map(col => {
        // Échapper les virgules et les guillemets
        const value = String(row[col] || '');
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'export_data.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportation réussie",
      description: "Les données ont été exportées au format CSV",
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCSV}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toast({
              title: "Filtres",
              description: "Fonctionnalité de filtres avancés à venir",
            })}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="data-grid">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column}
                    className="cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column}</span>
                      {sortColumn === column && (
                        sortDirection === 'asc' ? 
                          <SortAsc className="h-4 w-4" /> : 
                          <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr className="hover:bg-muted/50 transition-colors">
                    {columns.map((column) => (
                      <td key={column}>
                        {typeof row[column] === 'object' 
                          ? JSON.stringify(row[column]) 
                          : String(row[column] || '')}
                      </td>
                    ))}
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRow(expandedRow === rowIndex ? null : rowIndex)}
                      >
                        {expandedRow === rowIndex ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                  {expandedRow === rowIndex && (
                    <tr>
                      <td colSpan={columns.length + 1}>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 bg-muted/30"
                        >
                          <h4 className="font-medium mb-2">Détails de la ligne</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {columns.map((column) => (
                              <div key={column} className="flex flex-col">
                                <span className="text-sm font-medium">{column}:</span>
                                <span className="text-sm">
                                  {typeof row[column] === 'object' 
                                    ? JSON.stringify(row[column]) 
                                    : String(row[column] || '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Affichage de {startIndex + 1} à {Math.min(startIndex + rowsPerPage, filteredData.length)} sur {filteredData.length} entrées
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Calculer les pages à afficher
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={i}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
