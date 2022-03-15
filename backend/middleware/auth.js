const jwt = require('jsonwebtoken');
const jwtSecret = require('../config').jwtSecret;

const checkAuth = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token === undefined)
        return res.status(401).json({message: 'Failed to authenticate'});

    token = token.split('Bearer ')[1]

    if (!token)
        return res.status(401).json({message: 'Failed to authenticate'});

    jwt.verify(token, jwtSecret, (err, data) => {
        if (err) return res.status(400).json({message: 'Failed to authenticate'});
        req.user = {id: data.user};
        next();
    })
}

module.exports = checkAuth
