# Collaborative Data Analysis Web Application

## Project Title and Description

This project is a collaborative web application designed for importing, analyzing, and visualizing datasets. It provides a multi-user environment with features for secure authentication, role-based access control, data traceability, and interactive data exploration. The application aims to empower teams to work together on data-driven tasks.

## Features

*   **Authentication & Roles:**
    *   Secure login (JWT)
    *   Role management: admin / analyst
    *   User creation, modification, and deletion
*   **Data Importation:**
    *   Support for CSV and XLSX formats
    *   Basic data cleaning and preview
    *   Storage in PostgreSQL
*   **Dynamic Visualization:**
    *   Interactive charts: bar, line, pie, etc.
    *   Temporal and categorical filtering
    *   Interactive data tables
*   **Data Analysis:**
    *   Statistical calculations: mean, median, standard deviation
    *   Correlation analysis, anomaly detection
    *   (Bonus) Prediction capabilities
*   **Reports and Exports:**
    *   PDF report generation
    *   Export of charts and data
*   **Audit and Traceability:**
    *   User action history
    *   Access interface for logs

## Technologies Used

**Frontend:**

*   React
*   React Router DOM
*   Axios
*   Chart.js / react-chartjs-2 (for visualization)

**Backend:**

*   Node.js
*   Express.js
*   PostgreSQL (via `pg`)
*   Bcryptjs (for password hashing)
*   JSON Web Token (JWT)
*   Multer (for file uploads)
*   csv-parser / xlsx (for data parsing)

**Other:**

*   Docker / Docker Compose
*   HTTPS
*   CORS/CSRF Protection
*   (Bonus) CI/CD
*   (Bonus) Cloud Deployment

## Project Structure
```
.
├── README.md
├── package.json             # Root project dependencies (e.g., concurrently)
├── docker-compose.yml       # Docker orchestration
├── backend
│   ├── package.json         # Backend dependencies
│   ├── server.js            # Main backend entry point
│   ├── src
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers/business logic
│   │   │   ├── authController.js
│   │   │   ├── dataController.js
│   │   │   ├── visualizationController.js
│   │   │   ├── analysisController.js
│   │   │   ├── reportController.js
│   │   │   └── adminController.js
│   │   ├── middleware/      # Express middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/          # Database models
│   │   │   ├── User.js
│   │   │   └── Data.js      # Placeholder, data structure in DB
│   │   ├── routes/          # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── dataRoutes.js
│   │   │   ├── visualizationRoutes.js
│   │   │   ├── analysisRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/        # Service layer (business logic)
│   │   │   ├── authService.js
│   │   │   ├── dataService.js
│   │   │   ├── analysisService.js
│   │   │   └── reportService.js
│   │   └── utils/           # Utility functions (DB connection, helpers)
│   │       ├── db.js        # Database connection setup
│   │       └── helpers.js
│   └── .env                 # Environment variables for backend
│   └── Dockerfile           # Dockerfile for backend
└── frontend
    ├── package.json         # Frontend dependencies
    ├── public               # Public assets
    │   └── index.html
    ├── src
    │   ├── assets/          # Images, fonts, etc.
    │   ├── components/      # Reusable components
    │   │   ├── auth/
    │   │   ├── layout/
    │   │   ├── dashboard/
    │   │   ├── data/
    │   │   ├── visualization/
    │   │   ├── analysis/
    │   │   ├── reports/
    │   │   └── admin/
    │   ├── context/         # React contexts
    │   ├── hooks/           # Custom hooks
    │   ├── services/        # API services
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── dataService.js
    │   │   ├── chartService.js
    │   │   └── reportService.js
    │   ├── utils/           # Utility functions
    │   ├── pages/           # Main pages
    │   ├── routes/          # Route configuration
    │   └── App.jsx          # Root component
    └── .env                 # Environment variables for frontend
    └── Dockerfile           # Dockerfile for frontend
```
## Getting Started

### Prerequisites

*   Docker and Docker Compose installed on your machine.
*   Node.js and npm (optional, for running outside Docker or initial setup).

### Installation

1.  Clone the repository:
```
bash
    git clone <repository_url>
    cd <project_directory>
    
```
2.  Create the necessary `.env` files:
    *   Create a `.env` file in the `backend` directory.
    *   Create a `.env` file in the `frontend` directory.
    *   Refer to the "Environment Variables" section for required variables.

3.  (Optional) Install dependencies for development outside Docker:
```
bash
    cd backend
    npm install
    cd ../frontend
    npm install
    cd ..
    
```
### Running with Docker Compose

1.  Build the Docker images:
```
bash
    docker-compose build
    
```
2.  Run the services:
```
bash
    docker-compose up
    
```
The application should now be running. The frontend will be accessible at `http://localhost:3000` and the backend at `http://localhost:3001`.

## Environment Variables

### `backend/.env`
```
PORT=3001
DB_USER=<your_db_user>
DB_HOST=<your_db_host> # For Docker, this will be the service name, e.g., 'db'
DB_DATABASE=<your_db_name>
DB_PASSWORD=<your_db_password>
DB_PORT=<your_db_port> # Default PostgreSQL port is 5432
JWT_SECRET=<a_strong_secret_key_for_JWT>
```
### `frontend/.env`
```
REACT_APP_BACKEND_URL=http://localhost:3001/api # Or the appropriate backend URL when deployed
```
## Database Setup

The `docker-compose.yml` file includes a PostgreSQL database service. When you run `docker-compose up`, the database container will be created.

You will need to connect to the database (using a client like `psql` or pgAdmin) and create the necessary tables, specifically the `users` table and the `datasets` table (or tables for your data storage).

Example SQL for `users` table:
```
sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analyst'
);
```
Example SQL for `datasets` table (adjust columns based on your data):
```
sql
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    upload_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data JSONB -- Example column for storing parsed data
);
```
## API Endpoints

**Authentication:**

*   `POST /api/auth/register` - Register a new user
*   `POST /api/auth/login` - Login a user and get a JWT

**Data:**

*   `POST /api/data/import` - Upload and import a dataset (requires authentication)
*   `POST /api/data/preview` - Upload a file and get a data preview (requires authentication)
*   `GET /api/data/datasets/:datasetId` - Get a specific dataset by ID (requires authentication)
*   `GET /api/data/datasets` - Get a list of available datasets for the authenticated user (requires authentication)

**Analysis:**

*   `POST /api/data/analyze/statistics` - Calculate statistics for a dataset (requires authentication)
*   `POST /api/data/analyze/correlation` - Perform correlation analysis (requires authentication)
*   `POST /api/data/analyze/anomaly` - Perform anomaly detection (requires authentication)

**Admin:**

*   `GET /api/admin/users` - Get all users (requires admin role)
*   `POST /api/admin/users` - Create a new user (requires admin role)
*   `PUT /api/admin/users/:userId` - Update a user (requires admin role)
*   `DELETE /api/admin/users/:userId` - Delete a user (requires admin role)
*   `GET /api/admin/logs` - Get audit logs (requires admin role)

*(Note: This is not an exhaustive list and will evolve as the project is developed.)*

## Frontend Routes

*   `/login` - Login Page
*   `/register` - Registration Page
*   `/dashboard` - Dashboard Page (Protected Route)
*   `/data` - Data Management Page (Protected Route)
*   `/visualization` - Data Visualization Page (Protected Route)
*   `/analysis` - Data Analysis Page (Protected Route)
*   `/reports` - Reports Page (Protected Route)
*   `/admin` - Admin Page (Protected Route, requires admin role)

## Future Enhancements

*   Implement remaining features: advanced data cleaning, more visualization types, prediction capabilities, PDF reports, detailed audit logs interface.
*   Improve data validation and parsing robustness.
*   Implement role-based access control more strictly on backend endpoints.
*   Add unit and integration tests.
*   Set up Continuous Integration and Continuous Deployment (CI/CD) pipelines.
*   Explore cloud deployment options (e.g., AWS, Heroku).
*   Implement real-time collaboration features.
*   Enhance user interface and user experience.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bugfix.
3.  Make your changes and ensure the code adheres to the project's coding standards.
4.  Write tests for your changes.
5.  Commit your changes with clear and concise commit messages.
6.  Push your branch to your fork.
7.  Create a pull request to the main repository.

Please ensure your pull request includes a clear description of the changes and any relevant information.