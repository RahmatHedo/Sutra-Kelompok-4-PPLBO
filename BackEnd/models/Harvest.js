const db = require('../config/connection');

class Harvest {
    static async create(harvestData) {
        const { petani_id, tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan, foto, status } = harvestData;
        const query = `
            INSERT INTO harvests 
            (petani_id, tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan, foto, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [petani_id, tanggal_panen, komoditas, jumlah, satuan, lokasi, luas || null, cuaca || null, kualitas || null, catatan || null, foto, status];
        const [result] = await db.query(query, values);
        return result;
    }

    static async findByPetaniId(petani_id, filters = {}) {
        let query = 'SELECT * FROM harvests WHERE petani_id = ?';
        const params = [petani_id];

        if (filters.year && filters.year !== 'all') { query += ' AND YEAR(tanggal_panen) = ?'; params.push(filters.year); }
        if (filters.month && filters.month !== 'all') { query += ' AND MONTH(tanggal_panen) = ?'; params.push(filters.month); }
        if (filters.komoditas && filters.komoditas !== 'all') { query += ' AND komoditas = ?'; params.push(filters.komoditas); }

        query += ' ORDER BY created_at DESC';
        const [rows] = await db.query(query, params);
        return rows;
    }

    static async findByDaerah(daerah, filters = {}) {
        let query = `
            SELECT h.*, u.nama as nama_petani 
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ? 
        `;
        const params = [daerah];

        if (filters.year && filters.year !== 'all') { query += ' AND YEAR(h.tanggal_panen) = ?'; params.push(filters.year); }
        if (filters.month && filters.month !== 'all') { query += ' AND MONTH(h.tanggal_panen) = ?'; params.push(filters.month); }
        if (filters.komoditas && filters.komoditas !== 'all') { query += ' AND h.komoditas = ?'; params.push(filters.komoditas); }
        if (filters.petani && filters.petani !== 'all') { query += ' AND u.nama = ?'; params.push(filters.petani); }

        query += ' ORDER BY h.created_at DESC';
        const [rows] = await db.query(query, params);
        return rows;
    }

    static async updateStatus(id, status, catatan_ketua = null) {
        const query = 'UPDATE harvests SET status = ?, catatan_ketua = ? WHERE id = ?';
        const [result] = await db.query(query, [status, catatan_ketua, id]);
        return result;
    }

    static async findById(id) {
        const query = `
            SELECT h.*, u.nama as nama_petani, u.daerah
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE h.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        return rows;
    }

    static async getStatsPetani(petani_id) {
        const query = `
            SELECT 
                COUNT(*) as total_panen,
                SUM(CASE WHEN status = 'verified' THEN jumlah ELSE 0 END) as total_verified_kg
            FROM harvests WHERE petani_id = ?
        `;
        const [rows] = await db.query(query, [petani_id]);
        return rows;
    }

    static async getStatsKetua(daerah) {
        const query = `
            SELECT 
                COUNT(*) as total_pengajuan,
                SUM(CASE WHEN h.status = 'pending' THEN 1 ELSE 0 END) as total_pending
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ?
        `;
        const [rows] = await db.query(query, [daerah]);
        return rows;
    }

    static async getReportPetani(petani_id, year, month, komoditas) {
        let query = `
            SELECT 
                MONTH(tanggal_panen) as month,
                SUM(CASE WHEN LOWER(satuan) = 'ton' THEN jumlah * 1000 WHEN LOWER(satuan) = 'kuintal' OR LOWER(satuan) = 'kwintal' THEN jumlah * 100 ELSE jumlah END) as total_panen_kg,
                SUM(CASE WHEN status = 'verified' THEN (CASE WHEN LOWER(satuan) = 'ton' THEN jumlah * 1000 WHEN LOWER(satuan) = 'kuintal' OR LOWER(satuan) = 'kwintal' THEN jumlah * 100 ELSE jumlah END) ELSE 0 END) as total_verified_kg
            FROM harvests 
            WHERE petani_id = ? AND YEAR(tanggal_panen) = ?
        `;
        const params = [petani_id, year];
        
        if (month && month !== 'all') { query += ` AND MONTH(tanggal_panen) = ?`; params.push(month); }
        if (komoditas && komoditas !== 'all') { query += ` AND komoditas = ?`; params.push(komoditas); }

        query += ` GROUP BY MONTH(tanggal_panen) ORDER BY month ASC`;
        const [rows] = await db.query(query, params);
        return rows;
    }

    static async getReportKetua(daerah, year, month, komoditas, petani_nama) {
        let query = `
            SELECT 
                MONTH(h.tanggal_panen) as month,
                SUM(CASE WHEN LOWER(h.satuan) = 'ton' THEN h.jumlah * 1000 WHEN LOWER(h.satuan) = 'kuintal' OR LOWER(h.satuan) = 'kwintal' THEN h.jumlah * 100 ELSE h.jumlah END) as total_panen_kg,
                SUM(CASE WHEN h.status = 'verified' THEN (CASE WHEN LOWER(h.satuan) = 'ton' THEN h.jumlah * 1000 WHEN LOWER(h.satuan) = 'kuintal' OR LOWER(h.satuan) = 'kwintal' THEN h.jumlah * 100 ELSE h.jumlah END) ELSE 0 END) as total_verified_kg
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ? AND YEAR(h.tanggal_panen) = ?
        `;
        const params = [daerah, year];

        if (month && month !== 'all') { query += ` AND MONTH(h.tanggal_panen) = ?`; params.push(month); }
        if (komoditas && komoditas !== 'all') { query += ` AND h.komoditas = ?`; params.push(komoditas); }
        if (petani_nama && petani_nama !== 'all') { query += ` AND u.nama = ?`; params.push(petani_nama); }

        query += ` GROUP BY MONTH(h.tanggal_panen) ORDER BY month ASC`;
        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = Harvest;
