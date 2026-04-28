const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('./db');
const User = require('./User');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

app.use(session({
  secret: 'mySecret123',
  resave: false,
  saveUninitialized: false
}));

function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.status(401).send('❌ Not logged in. Please POST to /login first.');
}

app.get('/users', async (req, res) => {
  // We read directly from Mongoose using the same model inside User.js
  const UserModel = mongoose.model('Login');
  const allUsers = await UserModel.find({});
  res.json(allUsers);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'username and password required' });

  try {
    const user = new User(username, password);
    const result = await user.register();
    res.status(201).json({ message: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'username and password required' });

  try {
    const user = new User(username, password);
    const result = await user.login();
    req.session.user = username;           // ← save in session
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.json({ message: `Welcome ${req.session.user}` });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logout successful' });
  });
});

app.listen(3000, () => {
  console.log('🚀 Server running!');
  console.log('👉 Open in browser: http://localhost:3000');
});