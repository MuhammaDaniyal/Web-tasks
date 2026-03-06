const mongoose = require('mongoose');

// "logins" here matches your collection called "login" in Compass
// Mongoose automatically looks for the plural lowercase version
// So mongoose.model('Login', ...) => looks for "logins" collection
// We force the exact name "login" using the 3rd argument below

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

// 3rd argument 'login' forces Mongoose to use YOUR exact collection name
const UserModel = mongoose.model('Login', userSchema, 'login');

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  async register() {
    const exists = await UserModel.findOne({ username: this.username });
    if (exists) throw new Error('Username already taken');

    const newUser = new UserModel({
      username: this.username,
      password: this.password
    });
    await newUser.save();
    return 'User registered successfully';
  }

  async login() {
    const found = await UserModel.findOne({ username: this.username });
    if (!found) throw new Error('User not found');
    if (found.password !== this.password) throw new Error('Wrong password');
    return 'Login successful';
  }
}

module.exports = User;