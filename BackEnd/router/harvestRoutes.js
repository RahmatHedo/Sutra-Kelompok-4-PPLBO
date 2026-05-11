const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { authenticateToken } = require('../middleware/auth');
const { 
    createHarvest, 
    getHarvestsByPetani, 
    getHarvestsForKetua, 
    updateHarvestStatus,
    getHarvestById,
    getHarvestStats,
    getHarvestReport
} = require('../controllers/harvestController');

// Harus login untuk semua route ini
router.use(authenticateToken);

// Endpoint Dashboard (harus sebelum /:id agar tidak confuse)
router.get('/stats', getHarvestStats);
router.get('/report', getHarvestReport);

// Endpoint Petani
router.post('/', upload.single('foto'), createHarvest);
router.get('/petani', getHarvestsByPetani);

// Endpoint Ketua
router.get('/ketua', getHarvestsForKetua);
router.put('/:id/status', updateHarvestStatus);

// Endpoint Detail Harvest (Single) - harus setelah route spesifik
router.get('/:id', getHarvestById);

module.exports = router;
