const db = require('../config/connection');

const getAllUsers = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        
        let query = 'SELECT id, nama, email, alamat, daerah, komoditas, lahan, role, status, created_at FROM users';
        let params = [];

        if (role === 'ketua') {
            const [ketuaInfo] = await db.query('SELECT daerah FROM users WHERE id = ?', [userId]);
            if (ketuaInfo.length > 0) {
                const daerah = ketuaInfo[0].daerah;
                query += ' WHERE (role = "petani" OR role = "ketua") AND daerah = ?';
                params.push(daerah);
            }
        }

        const [rows] = await db.query(query, params);
        
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
        const query = 'SELECT id, nama, email, alamat, daerah, komoditas, lahan, role, status, created_at FROM users WHERE id = ?';
        const [rows] = await db.query(query, [id]);

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
        const query = 'UPDATE users SET nama = ?, alamat = ?, daerah = ? WHERE id = ?';
        const [result] = await db.query(query, [nama, alamat, daerah, id]);

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
        const query = 'UPDATE users SET status = "acc" WHERE id = ? AND role = "ketua"';
        const [result] = await db.query(query, [id]);

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
        const query = 'DELETE FROM users WHERE id = ?';
        const [result] = await db.query(query, [id]);

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
        const [users] = await db.query('SELECT status FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan!" });
        }
        
        const currentStatus = users[0].status;
        const newStatus = currentStatus === 'acc' ? 'pending' : 'acc';
        
        const query = 'UPDATE users SET status = ? WHERE id = ?';
        await db.query(query, [newStatus, id]);
        
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