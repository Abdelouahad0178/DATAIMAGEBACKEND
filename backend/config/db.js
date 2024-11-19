const mongoose = require('mongoose');

const uri = 'mongodb+srv://abdelouahad165:64oPEKJDxnkZfiV9@cluster0.kvvhl4c.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;
