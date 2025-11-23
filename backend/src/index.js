const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const db = require('./db'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/stats', require('./routes/stats'));

app.get('/', (req, res) => {
    res.send('HRMS Backend API is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});