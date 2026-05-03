
const isAdmin = (req, res, next) => {
    
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: "Akses Terlarang! Halaman ini khusus Admin." });
    }
};


const isPetani = (req, res, next) => {
    if (req.user && req.user.role === 'petani') {
        next(); 
    } else {
        res.status(403).json({ message: "Akses Terlarang! Fitur ini khusus Petani." });
    }
};

module.exports = { isAdmin, isPetani };