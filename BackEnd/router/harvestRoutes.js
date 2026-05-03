const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { authenticateToken } = require('../middleware/auth');
const { 
    createHarvest, 
    getHarvestsByPetani, 
    getHarvestsForKetua, 
    updateHarvestStatus, 
    getHarvestStats 
} = require('../controllers/harvestController');

// Harus login untuk semua route ini
router.use(authenticateToken);

// Endpoint Petani
router.post('/', upload.single('foto'), createHarvest);
router.get('/petani', getHarvestsByPetani);

// Endpoint Ketua
router.get('/ketua', getHarvestsForKetua);
router.put('/:id/status', updateHarvestStatus);

// Endpoint Dashboard
router.get('/stats', getHarvestStats);

module.exports = router;
