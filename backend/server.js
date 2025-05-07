const express = require('express');
require('dotenv').config(); // Load environment variables
const authRoutes = require('./src/routes/authRoutes');
const dataRoutes = require('./src/routes/dataRoutes'); // Import data routes

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variables or default to 3000

// Use authentication routes
app.use('/api/auth', authRoutes);
// Use data routes
app.use('/api/data', dataRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
