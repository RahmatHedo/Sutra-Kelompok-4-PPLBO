const db = require('../config/connection');

// 1. CREATE HARVEST (Input Panen)
const createHarvest = async (req, res) => {
    const petani_id = req.user.id;
    const { tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan } = req.body;
    const foto = req.file ? req.file.filename : null;

    if (!tanggal_panen || !komoditas || !jumlah || !satuan || !lokasi) {
        return res.status(400).json({ message: "Data wajib (*) harus diisi!" });
    }

    try {
        const query = `
            INSERT INTO harvests 
            (petani_id, tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan, foto, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        const values = [petani_id, tanggal_panen, komoditas, jumlah, satuan, lokasi, luas || null, cuaca || null, kualitas || null, catatan || null, foto];
        
        const [result] = await db.query(query, values);

        res.status(201).json({
            message: "Data panen berhasil disimpan dan menunggu verifikasi ketua",
            harvestId: result.insertId
        });
    } catch (error) {
        console.error("Create Harvest Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. GET ALL HARVESTS BY PETANI (Riwayat & Tracking Petani)
const getHarvestsByPetani = async (req, res) => {
    const petani_id = req.user.id;

    try {
        const query = 'SELECT * FROM harvests WHERE petani_id = ? ORDER BY created_at DESC';
        const [rows] = await db.query(query, [petani_id]);
        
        res.json({
            message: "Berhasil mengambil riwayat panen",
            data: rows
        });
    } catch (error) {
        console.error("Get Harvests Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. GET HARVESTS FOR KETUA (Berdasarkan kelompok_tani yang sama)
const getHarvestsForKetua = async (req, res) => {
    const ketua_id = req.user.id;

    try {
        // Ambil daerah dari ketua
        const [ketuaInfo] = await db.query('SELECT daerah FROM users WHERE id = ?', [ketua_id]);
        if (ketuaInfo.length === 0) {
            return res.status(404).json({ message: "Ketua tidak ditemukan" });
        }
        
        const daerah = ketuaInfo[0].daerah;

        const query = `
            SELECT h.*, u.nama as nama_petani 
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ? 
            ORDER BY h.created_at DESC
        `;
        const [rows] = await db.query(query, [daerah]);
        
        res.json({
            message: "Berhasil mengambil data panen kelompok",
            data: rows
        });
    } catch (error) {
        console.error("Get Harvests For Ketua Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4. UPDATE HARVEST STATUS (Verifikasi Ketua)
const updateHarvestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'verified' atau 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status tidak valid" });
    }

    try {
        const query = 'UPDATE harvests SET status = ? WHERE id = ?';
        const [result] = await db.query(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Data panen tidak ditemukan" });
        }

        res.json({ message: `Status panen berhasil diubah menjadi ${status}` });
    } catch (error) {
        console.error("Update Harvest Status Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. GET HARVEST STATS (Untuk Dashboard)
const getHarvestStats = async (req, res) => {
    const user_id = req.user.id;
    const role = req.user.role;

    try {
        let stats = {};
        if (role === 'petani') {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_panen,
                    SUM(CASE WHEN status = 'verified' THEN jumlah ELSE 0 END) as total_verified_kg
                FROM harvests WHERE petani_id = ?
            `, [user_id]);
            stats = rows[0];
        } else if (role === 'ketua') {
            const [ketuaInfo] = await db.query('SELECT daerah FROM users WHERE id = ?', [user_id]);
            const daerah = ketuaInfo[0].daerah;
            
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_pengajuan,
                    SUM(CASE WHEN h.status = 'pending' THEN 1 ELSE 0 END) as total_pending
                FROM harvests h
                JOIN users u ON h.petani_id = u.id
                WHERE u.daerah = ?
            `, [daerah]);
            stats = rows[0];
        }

        res.json({ data: stats });
    } catch (error) {
        console.error("Get Harvest Stats Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    createHarvest,
    getHarvestsByPetani,
    getHarvestsForKetua,
    updateHarvestStatus,
    getHarvestStats
};
