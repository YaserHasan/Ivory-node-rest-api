const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const accessToken = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {"alg": "HS256"});
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'unathorized request'
        });
    }
};