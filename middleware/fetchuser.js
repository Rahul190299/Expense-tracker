const jwt=require('jsonwebtoken');
const { reset } = require('nodemon');
const JWT_SIGN=process.env.SECRETKEY;
const fetchuser=(req,res,next)=>{
    const token=req.header('authToken');
    if(!token){
        res.status(401).json({errors:"Authentication Failed"});
    }
    try {
        const data=jwt.verify(token,JWT_SIGN);
        req.user=data.user;
        next();
    } catch (error) {
        res.status(401).json({errors:error});
    }
}
module.exports=fetchuser;