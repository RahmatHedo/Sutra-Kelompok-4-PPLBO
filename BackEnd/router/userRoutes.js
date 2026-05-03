const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    approveKetua, 
    deleteUser,
    toggleUserStatus
} = require('../controllers/userController');

// Rute CRUD Dasar
router.get('/', authenticateToken, getAllUsers);               // Ambil semua data
router.get('/:id', authenticateToken, getUserById);            // Ambil data 1 orang berdasarkan ID
router.put('/:id', authenticateToken, updateUser);             // Update profil
router.delete('/:id', authenticateToken, deleteUser);          // Hapus akun
router.patch('/:id/toggle-status', authenticateToken, toggleUserStatus); // Aktif/Nonaktif akun

// Rute Khusus Admin
router.patch('/approve/:id', approveKetua); // ACC akun ketua

// SANGAT PENTING: Harus diekspor seperti ini
module.exports = router;