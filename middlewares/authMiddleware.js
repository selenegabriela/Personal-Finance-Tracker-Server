const jwt = require('jsonwebtoken');

const protect = (req,res,next) => {
    const token = req.header('Authorization');
    if(!token) return res.status(401).json({error: 'No token, authorization denied'})

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded.id;

        next()
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
}

module.exports = protect