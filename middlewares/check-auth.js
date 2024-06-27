const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    try {
        let token = req.cookies.token;
        if(req.headers.authorization !== undefined) {
            console.log("check",req.headers.authorization);
            token = req.headers.authorization.split(" ")[1]
            console.log(token)
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token Expired"
        })
    }
}