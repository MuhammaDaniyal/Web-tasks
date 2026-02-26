
const express = require('express');
const session = require('express-session');

const app = express();

// Configure session middleware
app.use(session({
    secret: "gggggghhhhhh", // Secret key for signing the session ID
    resave: false, // Prevents resaving session if nothing has changed
    saveUninitialized: false // Prevents saving uninitialized sessions
}));

app.use(express.json());