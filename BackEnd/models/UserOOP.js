const db = require('../config/connection');
const User = require('./User'); 


class UserBase {
    #id;
    #role;

    constructor(id, role) {
        this.#id = id;
        this.#role = role;
    }

    getId() { return this.#id; }
    getRole() { return this.#role; }
    // Abstract Methods
    async getDashboardStats() {
        throw new Error("Method getDashboardStats() harus diimplementasi oleh subclass!");
    }

    async getHarvestReport(year, month, komoditas, petani_nama) {
        throw new Error("Method getHarvestReport() harus diimplementasi oleh subclass!");
    }

    async getHarvestList(filters) {
        throw new Error("Method getHarvestList() harus diimplementasi oleh subclass!"); 
    }
}


class Petani extends UserBase {
    constructor(id) {
        super(id, 'petani');
    }

    // POLYMORPHISM: Override
    async getDashboardStats() {
        const query = `
            SELECT 
                COUNT(*) as total_panen,
                SUM(CASE WHEN status = 'verified' THEN (CASE WHEN LOWER(satuan) = 'ton' THEN jumlah WHEN LOWER(satuan) = 'kuintal' OR LOWER(satuan) = 'kwintal' THEN jumlah / 10 ELSE jumlah / 1000 END) ELSE 0 END) as total_verified_ton
            FROM harvests WHERE petani_id = ?
        `;
        const [rows] = await db.query(query, [this.getId()]);
        return rows[0] || { total_panen: 0, total_verified_ton: 0 };
    }

    // POLYMORPHISM: Override
    async getHarvestReport(year, month, komoditas) {
        let query = `
            SELECT 
                MONTH(tanggal_panen) as month,
                SUM(CASE WHEN LOWER(satuan) = 'ton' THEN jumlah WHEN LOWER(satuan) = 'kuintal' OR LOWER(satuan) = 'kwintal' THEN jumlah / 10 ELSE jumlah / 1000 END) as total_panen_ton,
                SUM(CASE WHEN status = 'verified' THEN (CASE WHEN LOWER(satuan) = 'ton' THEN jumlah WHEN LOWER(satuan) = 'kuintal' OR LOWER(satuan) = 'kwintal' THEN jumlah / 10 ELSE jumlah / 1000 END) ELSE 0 END) as total_verified_ton
            FROM harvests 
            WHERE petani_id = ? AND YEAR(tanggal_panen) = ?
        `;
        const params = [this.getId(), year];
        
        if (month && month !== 'all') { query += ` AND MONTH(tanggal_panen) = ?`; params.push(month); }
        if (komoditas && komoditas !== 'all') { query += ` AND komoditas = ?`; params.push(komoditas); }

        query += ` GROUP BY MONTH(tanggal_panen) ORDER BY month ASC`;
        const [rows] = await db.query(query, params);
        return rows;
    }

    // POLYMORPHISM: Override
    async getHarvestList(filters) {
        let query = 'SELECT * FROM harvests WHERE petani_id = ?';
        const params = [this.getId()];

        if (filters.year && filters.year !== 'all') { query += ' AND YEAR(tanggal_panen) = ?'; params.push(filters.year); }
        if (filters.month && filters.month !== 'all') { query += ' AND MONTH(tanggal_panen) = ?'; params.push(filters.month); }
        if (filters.komoditas && filters.komoditas !== 'all') { query += ' AND komoditas = ?'; params.push(filters.komoditas); }

        query += ' ORDER BY created_at DESC';
        const [rows] = await db.query(query, params);
        return rows;
    }
}


class Ketua extends UserBase {
    #daerah; 

    constructor(id, daerah) {
        super(id, 'ketua');
        this.#daerah = daerah;
    }

   
    async getDashboardStats() {
        const query = `
            SELECT 
                COUNT(*) as total_pengajuan,
                SUM(CASE WHEN h.status = 'pending' THEN 1 ELSE 0 END) as total_pending
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ?
        `;
        const [rows] = await db.query(query, [this.#daerah]);
        return rows[0] || { total_pengajuan: 0, total_pending: 0 };
    }

    // POLYMORPHISM: Override
    async getHarvestReport(year, month, komoditas, petani_nama) {
        let query = `
            SELECT 
                MONTH(h.tanggal_panen) as month,
                SUM(CASE WHEN LOWER(h.satuan) = 'ton' THEN h.jumlah WHEN LOWER(h.satuan) = 'kuintal' OR LOWER(h.satuan) = 'kwintal' THEN h.jumlah / 10 ELSE h.jumlah / 1000 END) as total_panen_ton,
                SUM(CASE WHEN h.status = 'verified' THEN (CASE WHEN LOWER(h.satuan) = 'ton' THEN h.jumlah WHEN LOWER(h.satuan) = 'kuintal' OR LOWER(h.satuan) = 'kwintal' THEN h.jumlah / 10 ELSE h.jumlah / 1000 END) ELSE 0 END) as total_verified_ton
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ? AND YEAR(h.tanggal_panen) = ?
        `;
        const params = [this.#daerah, year];

        if (month && month !== 'all') { query += ` AND MONTH(h.tanggal_panen) = ?`; params.push(month); }
        if (komoditas && komoditas !== 'all') { query += ` AND h.komoditas = ?`; params.push(komoditas); }
        if (petani_nama && petani_nama !== 'all') { query += ` AND u.nama = ?`; params.push(petani_nama); }

        query += ` GROUP BY MONTH(h.tanggal_panen) ORDER BY month ASC`;
        const [rows] = await db.query(query, params);
        return rows;
    }

    // POLYMORPHISM: Override
    async getHarvestList(filters) {
        let query = `
            SELECT h.*, u.nama as nama_petani 
            FROM harvests h
            JOIN users u ON h.petani_id = u.id
            WHERE u.daerah = ? 
        `;
        const params = [this.#daerah];

        if (filters.year && filters.year !== 'all') { query += ' AND YEAR(h.tanggal_panen) = ?'; params.push(filters.year); }
        if (filters.month && filters.month !== 'all') { query += ' AND MONTH(h.tanggal_panen) = ?'; params.push(filters.month); }
        if (filters.komoditas && filters.komoditas !== 'all') { query += ' AND h.komoditas = ?'; params.push(filters.komoditas); }
        if (filters.petani && filters.petani !== 'all') { query += ' AND u.nama = ?'; params.push(filters.petani); }

        query += ' ORDER BY h.created_at DESC';
        const [rows] = await db.query(query, params);
        return rows;
    }
}


class UserFactory {
    static async createFromReq(reqUser) {
        if (reqUser.role === 'petani') {
            return new Petani(reqUser.id);
        } else if (reqUser.role === 'ketua') {
            const ketuaInfo = await User.getKetuaDaerah(reqUser.id);
            if (!ketuaInfo || ketuaInfo.length === 0) {
                throw new Error("Ketua tidak ditemukan atau daerah belum diatur");
            }
            return new Ketua(reqUser.id, ketuaInfo[0].daerah);
        }
        
        // Fallback untuk role admin atau lainnya jika perlu
        return new UserBase(reqUser.id, reqUser.role);
    }
}

module.exports = { UserBase, Petani, Ketua, UserFactory };
