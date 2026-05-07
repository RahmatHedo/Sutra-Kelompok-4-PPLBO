const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        
        let daerah = null;
        if (role === 'ketua') {
            const ketuaInfo = await User.getKetuaDaerah(userId);
            if (ketuaInfo.length > 0) {
                daerah = ketuaInfo[0].daerah;
            }
        }

        const rows = await User.findAll(role, daerah);
        
        res.json({
            message: "Berhasil mengambil data user",
            data: rows
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. GET USER BY ID (Untuk melihat profil diri sendiri)
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const rows = await User.findProfileById(id);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan!" });
        }

        res.json({
            message: "Profil ditemukan",
            data: rows[0]
        });
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. UPDATE PROFIL (Untuk edit nama atau alamat)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nama, alamat, daerah } = req.body;

    // Pastikan data tidak kosong
    if (!nama || !alamat || !daerah) {
        return res.status(400).json({ message: "Nama, alamat, dan daerah tidak boleh kosong!" });
    }

    try {
        const result = await User.updateProfile(id, { nama, alamat, daerah });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User tidak ditemukan atau tidak ada perubahan!" });
        }

        res.json({ message: "Profil berhasil diperbarui!" });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4. APPROVE KETUA (Khusus Admin: Mengubah status 'pending' jadi 'acc')
const approveKetua = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await User.approveKetua(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "Gagal menyetujui. Pastikan user tersebut ada dan memiliki role 'ketua'." 
            });
        }

        res.json({ message: "Akun Ketua berhasil disetujui dan diaktifkan!" });
    } catch (error) {
        console.error("Approve Ketua Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. DELETE USER (Hapus akun)
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await User.deleteUser(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User tidak ditemukan!" });
        }

        res.json({ message: "Akun berhasil dihapus permanen!" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 6. TOGGLE STATUS (Aktif/Nonaktif)
const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    
    try {
        const users = await User.getStatus(id);
        if (users.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan!" });
        }
        
        const currentStatus = users[0].status;
        const newStatus = currentStatus === 'acc' ? 'pending' : 'acc';
        
        await User.updateStatus(id, newStatus);
        
        res.json({ message: `Status akun berhasil diubah menjadi ${newStatus === 'acc' ? 'Aktif' : 'Nonaktif'}` });
    } catch (error) {
        console.error("Toggle User Status Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    approveKetua,
    deleteUser,
    toggleUserStatus
};