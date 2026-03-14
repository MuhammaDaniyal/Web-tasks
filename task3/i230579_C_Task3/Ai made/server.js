const express = require('express');
const session = require('express-session');
const { User, connectDB } = require('./User');

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true })); // For form data
app.use(express.json()); // For JSON data
app.use(session({
    secret: 'your-secret-key-here', // Change this in production
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Authentication Middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next(); // User is logged in, continue
    } else {
        res.status(401).send('Please login first');
    }
};

// Routes

// Home route (simple form for testing)
app.get('/', (req, res) => {
    res.send(`
        <h2>Login System</h2>
        <h3>Register</h3>
        <form method="POST" action="/register">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Register</button>
        </form>
        
        <h3>Login</h3>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Login</button>
        </form>
    `);
});

// Register Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.send('Username and password required');
    }
    
    const user = new User(username, password);
    const result = await user.register();
    
    res.send(result.message);
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.send('Username and password required');
    }
    
    const user = new User(username, password);
    const result = await user.login();
    
    if (result.success) {
        // Create session
        req.session.user = username;
        res.send('Login successful');
    } else {
        res.send(result.message);
    }
});

// Protected Dashboard Route
app.get('/dashboard', requireAuth, (req, res) => {
    res.send(`Welcome ${req.session.user}`);
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send('Logout failed');
        } else {
            res.send('Logout successful');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});