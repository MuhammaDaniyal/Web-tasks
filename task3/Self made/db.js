const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/login_data')
  .then(() => console.log('✅ Connected to MongoDB - login_data'))
  .catch((err) => console.log('❌ Connection failed:', err.message));

module.exports = mongoose;