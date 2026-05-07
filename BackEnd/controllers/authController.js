const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- FITUR REGISTER ---
const register = async (req, res) => {
    const { nama, email, alamat, daerah, password, role } = req.body;

    if (!nama || !email || !alamat || !daerah || !password) {
        return res.status(400).json({ message: "Semua kolom wajib diisi!" });
    }

    try {
        // 1. Cek email langsung ke database
        const userExists = await User.findByEmail(email);
        if (userExists.length > 0) {
            return res.status(400).json({ message: "Email sudah terdaftar!" });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Logika Status Otomatis
        const roleFix = role || 'petani';
        let statusFix = 'pending';

        if (roleFix === 'petani' || roleFix === 'admin') {
            statusFix = 'acc';
        } else if (roleFix === 'ketua') {
            statusFix = 'pending';
        }

        // 4. Insert data langsung
        await User.create({
            nama, email, alamat, daerah, password: hashedPassword, role: roleFix, status: statusFix
        });

        res.status(201).json({
            message: statusFix === 'acc' 
                ? `Registrasi berhasil! Akun ${roleFix} otomatis aktif.` 
                : "Registrasi berhasil! Akun Ketua sedang menunggu persetujuan admin.",
            data: { nama, role: roleFix, status: statusFix }
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// --- FITUR LOGIN ---
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password wajib diisi!" });
    }

    try {
        // 1. Cari user berdasarkan email
        const users = await User.findByEmail(email);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Email tidak ditemukan!" });
        }

        const user = users[0];

        // 2. Cek apakah status sudah 'acc'
        if (user.status !== 'acc') {
            return res.status(403).json({ 
                message: "Akun anda belum disetujui oleh admin. Harap tunggu proses verifikasi." 
            });
        }

        // 3. Bandingkan Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah!" });
        }

        // 4. Buat Token JWT
        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: "Login berhasil!",
            token: token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                alamat: user.alamat,
                role: user.role,
                status: user.status,
                daerah: user.daerah,
                komoditas: user.komoditas,
                lahan: user.lahan
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { register, login };