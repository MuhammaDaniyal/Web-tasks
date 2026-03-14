const express = require('express');
const app = express();
const port = 3000;

// Import the route files
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');

// Use the routes with app.use()
app.use('/users', userRoutes);     // All user routes will start with /users
app.use('/search', searchRoutes);   // All search routes will start with /search

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});