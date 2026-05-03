const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/connection');
const authRoutes = require('./router/authRoutes');
const userRoutes = require('./router/userRoutes');
const harvestRoutes = require('./router/harvestRoutes');
const app = express();
const PORT = process.env.PORT 

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.use('/api/auth', authRoutes);
 
app.use('/api/users', userRoutes);

app.use('/api/harvests', harvestRoutes);

app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({
            message: "AgriChain Backend is Running!",
            db_status: "Connected ",
            test_result: rows[0].result
        });
    } catch (error) {
        res.status(500).json({ message: "Database Error ", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});