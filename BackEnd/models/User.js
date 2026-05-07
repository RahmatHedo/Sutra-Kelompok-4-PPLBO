const db = require('../config/connection');

class User {
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows;
    }

    static async create(userData) {
        const { nama, email, alamat, daerah, password, role, status } = userData;
        const query = `
            INSERT INTO users (nama, email, alamat, daerah, password, role, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nama, email, alamat, daerah, password, role, status]);
        return result;
    }

    static async getKetuaDaerah(id) {
        const [rows] = await db.query('SELECT daerah FROM users WHERE id = ?', [id]);
        return rows;
    }

    static async findAll(role, daerah) {
        let query = 'SELECT id, nama, email, alamat, daerah, komoditas, lahan, role, status, created_at FROM users';
        let params = [];

        if (role === 'ketua' && daerah) {
            query += ' WHERE (role = "petani" OR role = "ketua") AND daerah = ?';
            params.push(daerah);
        }

        const [rows] = await db.query(query, params);
        return rows;
    }

    static async findProfileById(id) {
        const query = 'SELECT id, nama, email, alamat, daerah, komoditas, lahan, role, status, created_at FROM users WHERE id = ?';
        const [rows] = await db.query(query, [id]);
        return rows;
    }

    static async updateProfile(id, data) {
        const { nama, alamat, daerah } = data;
        const query = 'UPDATE users SET nama = ?, alamat = ?, daerah = ? WHERE id = ?';
        const [result] = await db.query(query, [nama, alamat, daerah, id]);
        return result;
    }

    static async approveKetua(id) {
        const query = 'UPDATE users SET status = "acc" WHERE id = ? AND role = "ketua"';
        const [result] = await db.query(query, [id]);
        return result;
    }

    static async deleteUser(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result;
    }

    static async getStatus(id) {
        const [rows] = await db.query('SELECT status FROM users WHERE id = ?', [id]);
        return rows;
    }

    static async updateStatus(id, newStatus) {
        const query = 'UPDATE users SET status = ? WHERE id = ?';
        const [result] = await db.query(query, [newStatus, id]);
        return result;
    }
}

module.exports = User;
