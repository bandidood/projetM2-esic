
import { v4 as uuidv4 } from 'uuid';

// Clé pour le stockage local des projets
const PROJECTS_STORAGE_KEY = 'datacollab_projects';
const USERS_STORAGE_KEY = 'datacollab_users';
const CURRENT_USER_KEY = 'datacollab_current_user';
const ACTIVITY_LOG_KEY = 'datacollab_activity_log';

// Fonction pour obtenir tous les projets
export const getProjects = () => {
  const projects = localStorage.getItem(PROJECTS_STORAGE_KEY);
  return projects ? JSON.parse(projects) : [];
};

// Fonction pour obtenir un projet spécifique
export const getProject = (projectId) => {
  const projects = getProjects();
  return projects.find(project => project.id === projectId);
};

// Fonction pour créer un nouveau projet
export const createProject = (projectData) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour créer un projet");
  }

  const projects = getProjects();
  const newProject = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: currentUser.id,
    collaborators: [currentUser.id],
    data: [],
    visualizations: [],
    ...projectData
  };

  projects.push(newProject);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  
  // Enregistrer l'activité
  logActivity({
    type: 'project_created',
    projectId: newProject.id,
    userId: currentUser.id,
    details: `Projet "${newProject.name}" créé`
  });

  return newProject;
};

// Fonction pour mettre à jour un projet
export const updateProject = (projectId, projectData) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour mettre à jour un projet");
  }

  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) {
    throw new Error("Projet non trouvé");
  }
  
  // Vérifier si l'utilisateur est un collaborateur
  const project = projects[projectIndex];
  if (!project.collaborators.includes(currentUser.id)) {
    throw new Error("Vous n'avez pas les droits pour modifier ce projet");
  }
  
  // Mettre à jour le projet
  const updatedProject = {
    ...project,
    ...projectData,
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  
  // Enregistrer l'activité
  logActivity({
    type: 'project_updated',
    projectId: updatedProject.id,
    userId: currentUser.id,
    details: `Projet "${updatedProject.name}" mis à jour`
  });

  return updatedProject;
};

// Fonction pour supprimer un projet
export const deleteProject = (projectId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour supprimer un projet");
  }

  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    throw new Error("Projet non trouvé");
  }
  
  // Vérifier si l'utilisateur est le créateur
  if (project.createdBy !== currentUser.id) {
    throw new Error("Seul le créateur du projet peut le supprimer");
  }
  
  const updatedProjects = projects.filter(p => p.id !== projectId);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
  
  // Enregistrer l'activité
  logActivity({
    type: 'project_deleted',
    projectId: projectId,
    userId: currentUser.id,
    details: `Projet "${project.name}" supprimé`
  });

  return true;
};

// Fonction pour ajouter des données à un projet
export const addDataToProject = (projectId, data) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour ajouter des données");
  }

  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) {
    throw new Error("Projet non trouvé");
  }
  
  // Vérifier si l'utilisateur est un collaborateur
  const project = projects[projectIndex];
  if (!project.collaborators.includes(currentUser.id)) {
    throw new Error("Vous n'avez pas les droits pour modifier ce projet");
  }
  
  // Mettre à jour les données du projet
  const updatedProject = {
    ...project,
    data: data,
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  
  // Enregistrer l'activité
  logActivity({
    type: 'data_added',
    projectId: updatedProject.id,
    userId: currentUser.id,
    details: `Données ajoutées au projet "${updatedProject.name}"`
  });

  return updatedProject;
};

// Fonction pour ajouter une visualisation à un projet
export const addVisualizationToProject = (projectId, visualization) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour ajouter une visualisation");
  }

  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) {
    throw new Error("Projet non trouvé");
  }
  
  // Vérifier si l'utilisateur est un collaborateur
  const project = projects[projectIndex];
  if (!project.collaborators.includes(currentUser.id)) {
    throw new Error("Vous n'avez pas les droits pour modifier ce projet");
  }
  
  // Créer la nouvelle visualisation
  const newVisualization = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
    ...visualization
  };
  
  // Mettre à jour le projet
  const updatedProject = {
    ...project,
    visualizations: [...project.visualizations, newVisualization],
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  
  // Enregistrer l'activité
  logActivity({
    type: 'visualization_added',
    projectId: updatedProject.id,
    userId: currentUser.id,
    details: `Visualisation "${newVisualization.name}" ajoutée au projet "${updatedProject.name}"`
  });

  return updatedProject;
};

// Fonction pour ajouter un collaborateur à un projet
export const addCollaboratorToProject = (projectId, userId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour ajouter un collaborateur");
  }

  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) {
    throw new Error("Projet non trouvé");
  }
  
  // Vérifier si l'utilisateur est le créateur
  const project = projects[projectIndex];
  if (project.createdBy !== currentUser.id) {
    throw new Error("Seul le créateur du projet peut ajouter des collaborateurs");
  }
  
  // Vérifier si l'utilisateur existe
  const users = getUsers();
  const userExists = users.some(user => user.id === userId);
  if (!userExists) {
    throw new Error("Utilisateur non trouvé");
  }
  
  // Vérifier si l'utilisateur est déjà un collaborateur
  if (project.collaborators.includes(userId)) {
    throw new Error("Cet utilisateur est déjà un collaborateur du projet");
  }
  
  // Ajouter le collaborateur
  const updatedProject = {
    ...project,
    collaborators: [...project.collaborators, userId],
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  
  // Enregistrer l'activité
  const user = users.find(u => u.id === userId);
  logActivity({
    type: 'collaborator_added',
    projectId: updatedProject.id,
    userId: currentUser.id,
    details: `${user.name} ajouté comme collaborateur au projet "${updatedProject.name}"`
  });

  return updatedProject;
};

// Fonction pour obtenir tous les utilisateurs
export const getUsers = () => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

// Fonction pour créer un nouvel utilisateur
export const createUser = (userData) => {
  const users = getUsers();
  
  // Vérifier si l'email est déjà utilisé
  if (users.some(user => user.email === userData.email)) {
    throw new Error("Cet email est déjà utilisé");
  }
  
  const newUser = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...userData
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  return newUser;
};

// Fonction pour connecter un utilisateur
export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(user => user.email === email);
  
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  
  if (user.password !== password) {
    throw new Error("Mot de passe incorrect");
  }
  
  // Stocker l'utilisateur courant
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  
  return userWithoutPassword;
};

// Fonction pour déconnecter l'utilisateur
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  return true;
};

// Fonction pour obtenir l'utilisateur courant
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Fonction pour enregistrer une activité
export const logActivity = (activity) => {
  const activities = getActivityLog();
  
  const newActivity = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...activity
  };
  
  activities.push(newActivity);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(activities));
  
  return newActivity;
};

// Fonction pour obtenir le journal d'activité
export const getActivityLog = (projectId = null) => {
  const activities = localStorage.getItem(ACTIVITY_LOG_KEY);
  const allActivities = activities ? JSON.parse(activities) : [];
  
  if (projectId) {
    return allActivities.filter(activity => activity.projectId === projectId);
  }
  
  return allActivities;
};

// Initialiser des données de démonstration si nécessaire
export const initDemoData = () => {
  // Vérifier si des données existent déjà
  const users = getUsers();
  const projects = getProjects();
  
  if (users.length === 0 && projects.length === 0) {
    // Créer des utilisateurs de démonstration
    const demoUsers = [
      {
        name: "Admin",
        email: "admin@datacollab.com",
        password: "admin123",
        role: "admin"
      },
      {
        name: "Utilisateur Test",
        email: "user@datacollab.com",
        password: "user123",
        role: "user"
      }
    ];
    
    demoUsers.forEach(user => createUser(user));
    
    // Connecter l'utilisateur admin
    loginUser("admin@datacollab.com", "admin123");
    
    // Créer un projet de démonstration
    const demoProject = {
      name: "Projet de démonstration",
      description: "Un projet pour démontrer les fonctionnalités de DataCollab"
    };
    
    const createdProject = createProject(demoProject);
    
    // Ajouter des données de démonstration
    const demoData = [
      { mois: "Janvier", ventes: 1200, depenses: 800 },
      { mois: "Février", ventes: 1800, depenses: 1200 },
      { mois: "Mars", ventes: 1400, depenses: 1100 },
      { mois: "Avril", ventes: 2200, depenses: 1300 },
      { mois: "Mai", ventes: 2600, depenses: 1500 },
      { mois: "Juin", ventes: 2900, depenses: 1700 }
    ];
    
    addDataToProject(createdProject.id, demoData);
    
    // Ajouter une visualisation de démonstration
    const demoVisualization = {
      name: "Évolution des ventes et dépenses",
      type: "line",
      config: {
        xAxis: "mois",
        yAxis: ["ventes", "depenses"]
      }
    };
    
    addVisualizationToProject(createdProject.id, demoVisualization);
    
    return true;
  }
  
  return false;
};
