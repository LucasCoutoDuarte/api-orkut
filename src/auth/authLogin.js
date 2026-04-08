const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ mesagem: 'Token de autenticação não fornecido' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (erro) {
        return res.status(401).json({ mesagem: 'Token de autenticação inválido' });
    }
}


module.exports = auth;