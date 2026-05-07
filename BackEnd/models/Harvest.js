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

    static async findByPetaniId(petani_id) {
        const query = 'SELECT * FROM harvests WHERE petani_id = ? ORDER BY created_at DESC';
        const [rows] = await db.query(query, [petani_id]);
        return rows;
    }

    static async findByDaerah(daerah) {
        const query = `
            SELECT h.*, u.nama as nama_petani 
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ? 
            ORDER BY h.created_at DESC
        `;
        const [rows] = await db.query(query, [daerah]);
        return rows;
    }

    static async updateStatus(id, status) {
        const query = 'UPDATE harvests SET status = ? WHERE id = ?';
        const [result] = await db.query(query, [status, id]);
        return result;
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
}

module.exports = Harvest;
