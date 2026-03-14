const mongoose = require('mongoose');

// Connect to MongoDB (will be called from server.js)
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/studentDB');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

// Model - using 'users' collection (matches requirement)
const UserModel = mongoose.model('User', userSchema, 'users');

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    // Register method
    async register() {
        try {
            // Check if user already exists
            const existingUser = await UserModel.findOne({ username: this.username });
            if (existingUser) {
                return { success: false, message: 'Username already exists' };
            }

            // Create new user
            const newUser = new UserModel({
                username: this.username,
                password: this.password
            });
            
            await newUser.save();
            return { success: true, message: 'User registered successfully' };
        } catch (error) {
            return { success: false, message: 'Registration failed' };
        }
    }

    // Login method
    async login() {
        try {
            // Find user
            const user = await UserModel.findOne({ username: this.username });
            
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            
            if (user.password !== this.password) {
                return { success: false, message: 'Wrong password' };
            }
            
            return { success: true, message: 'Login successful', username: user.username };
        } catch (error) {
            return { success: false, message: 'Login failed' };
        }
    }
}

module.exports = { User, connectDB };