const Harvest = require('../models/Harvest');
const User = require('../models/User');
const { UserFactory } = require('../models/UserOOP');

// 1. CREATE HARVEST (Input Panen)
const createHarvest = async (req, res) => {
    const petani_id = req.user.id;
    const { tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan } = req.body;
    const foto = req.file ? req.file.filename : null;

    if (!tanggal_panen || !komoditas || !jumlah || !satuan || !lokasi) {
        return res.status(400).json({ message: "Data wajib (*) harus diisi!" });
    }

    try {
        const result = await Harvest.create({
            petani_id, tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan, foto, status: 'pending'
        });

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
    const filters = {
        year: req.query.year,
        month: req.query.month,
        komoditas: req.query.komoditas
    };

    try {
        const user = await UserFactory.createFromReq(req.user);
        const rows = await user.getHarvestList(filters);
        
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
    const filters = {
        year: req.query.year,
        month: req.query.month,
        komoditas: req.query.komoditas,
        petani: req.query.petani
    };

    try {
        const user = await UserFactory.createFromReq(req.user);
        const rows = await user.getHarvestList(filters);
        
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
    const { status, catatan_ketua } = req.body; // 'verified' atau 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status tidak valid" });
    }

    // Jika ditolak, catatan wajib diisi
    if (status === 'rejected' && (!catatan_ketua || !catatan_ketua.trim())) {
        return res.status(400).json({ message: "Harap isi catatan alasan penolakan" });
    }

    try {
        const result = await Harvest.updateStatus(id, status, catatan_ketua || null);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Data panen tidak ditemukan" });
        }

        const msg = status === 'verified'
            ? 'Panen berhasil disetujui'
            : 'Panen ditolak dengan catatan';
        res.json({ message: msg });
    } catch (error) {
        console.error("Update Harvest Status Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4b. GET SINGLE HARVEST BY ID (Untuk QR / Sertifikat)
const getHarvestById = async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await Harvest.findById(id);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Data panen tidak ditemukan" });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        console.error("Get Harvest By ID Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. GET HARVEST STATS (Untuk Dashboard)
const getHarvestStats = async (req, res) => {
    try {
        const user = await UserFactory.createFromReq(req.user);
        const stats = await user.getDashboardStats();

        res.json({ data: stats });
    } catch (error) {
        console.error("Get Harvest Stats Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 6. GET HARVEST REPORT (Untuk Grafik dan Laporan)
const getHarvestReport = async (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month;
    const komoditas = req.query.komoditas;
    const petani = req.query.petani;

    try {
        const user = await UserFactory.createFromReq(req.user);
        const reportData = await user.getHarvestReport(year, month, komoditas, petani);

        res.json({ data: reportData });
    } catch (error) {
        console.error("Get Harvest Report Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    createHarvest,
    getHarvestsByPetani,
    getHarvestsForKetua,
    updateHarvestStatus,
    getHarvestById,
    getHarvestStats,
    getHarvestReport
};

