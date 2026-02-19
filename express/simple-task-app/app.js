const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskapp')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Task Schema
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Create Task Model
const Task = mongoose.model('Task', taskSchema);

// Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const task = new Task({ title });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT (update) a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        if (title !== undefined) task.title = title;
        if (completed !== undefined) task.completed = completed;
        
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   GET    /api/tasks`);
    console.log(`   POST   /api/tasks`);
    console.log(`   PUT    /api/tasks/:id`);
    console.log(`   DELETE /api/tasks/:id`);
});