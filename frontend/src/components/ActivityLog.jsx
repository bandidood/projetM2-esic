
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivityLog } from '@/lib/data-service';
import { motion } from 'framer-motion';
import { Clock, User, FileText, BarChart2, Users } from 'lucide-react';

const ActivityLog = ({ projectId }) => {
  // Récupérer les activités du projet
  const activities = getActivityLog(projectId);
  
  // Trier les activités par date (les plus récentes en premier)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Obtenir l'icône en fonction du type d'activité
  const getActivityIcon = (type) => {
    switch (type) {
      case 'project_created':
      case 'project_updated':
      case 'project_deleted':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'data_added':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'visualization_added':
        return <BarChart2 className="h-5 w-5 text-purple-500" />;
      case 'collaborator_added':
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Journal d'activité
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aucune activité enregistrée
          </p>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="activity-log-item"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.details}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Utilisateur ID: {activity.userId}</span>
                      <span>•</span>
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
