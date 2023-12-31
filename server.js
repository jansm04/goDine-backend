const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const { callAPI } = require('./api-call');

// express app
const app = express();
app.use(cors());
app.use(express.json()); // middleware to parse data

app.get('/api/call', async (req, res) => {
    const city = req.query.city;
    const type = req.query.type;
    const mood = req.query.mood;
    try {
        const data = await callAPI(city, type, mood);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: `Error: ${error}`});
    }
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
})


