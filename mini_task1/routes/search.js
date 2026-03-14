const express = require('express');
const router = express.Router();

// This will be /search/
router.get("/", (req, res) => {
    const query = req.query.q;
    res.send(`Search Query: ${query || 'No query provided'}`);
});

// This will be /search/advanced
router.get("/advanced", (req, res) => {
    res.send("Advanced search page");
});

// This will be /search/filter
router.get("/filter", (req, res) => {
    res.send("Filter search results");
});

module.exports = router;