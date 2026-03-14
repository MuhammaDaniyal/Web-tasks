const express = require('express');
const router = express.Router();

// This will be /users/:id
router.get("/:id", (req, res) => {
    const userId = req.params.id;
    res.send(`User ID: ${userId}`);
});

// This will be /users/profile
router.get("/profile", (req, res) => {
    res.send("User profile page");
});

// This will be /users/list
router.get("/list", (req, res) => {
    res.send("List of all users");
});

module.exports = router;