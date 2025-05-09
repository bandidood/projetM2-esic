
import Papa from 'papaparse';

// Fonction pour analyser un fichier CSV
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(results.errors);
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Fonction pour analyser un fichier JSON
export const parseJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

// Fonction pour détecter le type de données
export const detectDataTypes = (data) => {
  if (!data || data.length === 0) {
    return {};
  }
  
  const firstRow = data[0];
  const types = {};
  
  Object.keys(firstRow).forEach(key => {
    const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined);
    
    if (values.length === 0) {
      types[key] = 'unknown';
    } else if (values.every(val => typeof val === 'number')) {
      types[key] = 'number';
    } else if (values.every(val => !isNaN(Date.parse(val)))) {
      types[key] = 'date';
    } else if (values.every(val => typeof val === 'boolean')) {
      types[key] = 'boolean';
    } else {
      types[key] = 'string';
    }
  });
  
  return types;
};

// Fonction pour obtenir des statistiques descriptives
export const getDataStats = (data) => {
  if (!data || data.length === 0) {
    return {};
  }
  
  const types = detectDataTypes(data);
  const stats = {};
  
  Object.keys(types).forEach(key => {
    const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined);
    
    stats[key] = {
      type: types[key],
      count: values.length,
      missing: data.length - values.length
    };
    
    if (types[key] === 'number') {
      const numValues = values.map(v => Number(v));
      stats[key].min = Math.min(...numValues);
      stats[key].max = Math.max(...numValues);
      stats[key].sum = numValues.reduce((a, b) => a + b, 0);
      stats[key].mean = stats[key].sum / stats[key].count;
      
      // Calculer l'écart-type
      const variance = numValues.reduce((acc, val) => acc + Math.pow(val - stats[key].mean, 2), 0) / stats[key].count;
      stats[key].stdDev = Math.sqrt(variance);
    } else if (types[key] === 'string') {
      // Calculer les valeurs uniques
      const uniqueValues = [...new Set(values)];
      stats[key].uniqueCount = uniqueValues.length;
      
      // Calculer les fréquences
      const frequencies = {};
      values.forEach(val => {
        frequencies[val] = (frequencies[val] || 0) + 1;
      });
      
      // Trouver la valeur la plus fréquente
      let maxFreq = 0;
      let mostFrequent = null;
      
      Object.entries(frequencies).forEach(([val, freq]) => {
        if (freq > maxFreq) {
          maxFreq = freq;
          mostFrequent = val;
        }
      });
      
      stats[key].mostFrequent = mostFrequent;
      stats[key].mostFrequentCount = maxFreq;
    }
  });
  
  return stats;
};

// Fonction pour filtrer les données
export const filterData = (data, filters) => {
  if (!filters || filters.length === 0) {
    return data;
  }
  
  return data.filter(row => {
    return filters.every(filter => {
      const { column, operator, value } = filter;
      const rowValue = row[column];
      
      switch (operator) {
        case 'equals':
          return rowValue === value;
        case 'notEquals':
          return rowValue !== value;
        case 'contains':
          return String(rowValue).includes(value);
        case 'greaterThan':
          return rowValue > value;
        case 'lessThan':
          return rowValue < value;
        case 'greaterThanOrEqual':
          return rowValue >= value;
        case 'lessThanOrEqual':
          return rowValue <= value;
        default:
          return true;
      }
    });
  });
};

// Fonction pour trier les données
export const sortData = (data, sortConfig) => {
  if (!sortConfig || !sortConfig.column) {
    return data;
  }
  
  const { column, direction } = sortConfig;
  const multiplier = direction === 'asc' ? 1 : -1;
  
  return [...data].sort((a, b) => {
    if (a[column] < b[column]) {
      return -1 * multiplier;
    }
    if (a[column] > b[column]) {
      return 1 * multiplier;
    }
    return 0;
  });
};

// Fonction pour agréger les données
export const aggregateData = (data, config) => {
  if (!config || !config.groupBy || !config.aggregations) {
    return data;
  }
  
  const { groupBy, aggregations } = config;
  
  // Regrouper les données
  const groups = {};
  
  data.forEach(row => {
    const groupKey = row[groupBy];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(row);
  });
  
  // Appliquer les agrégations
  const result = [];
  
  Object.entries(groups).forEach(([groupKey, groupRows]) => {
    const aggregatedRow = { [groupBy]: groupKey };
    
    aggregations.forEach(agg => {
      const { column, function: aggFunction } = agg;
      const values = groupRows.map(row => row[column]).filter(val => val !== null && val !== undefined);
      
      switch (aggFunction) {
        case 'sum':
          aggregatedRow[`${column}_sum`] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregatedRow[`${column}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'min':
          aggregatedRow[`${column}_min`] = Math.min(...values);
          break;
        case 'max':
          aggregatedRow[`${column}_max`] = Math.max(...values);
          break;
        case 'count':
          aggregatedRow[`${column}_count`] = values.length;
          break;
      }
    });
    
    result.push(aggregatedRow);
  });
  
  return result;
};
