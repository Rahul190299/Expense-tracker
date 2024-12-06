const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User=require('../models/User');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const JWT_SIGN=process.env.SECRETKEY;
const fetchuser=require('../middleware/fetchuser');
router.post('/createuser',[body('email').isEmail(),body('password').isLength({ min: 5 })],async(req,res)=>{
try {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    let user=await User.findOne({email:req.body.email});
    if(user){
        return res.status(401).json({errors:"User already exits with this email id"});
    }
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    user=new User({
        name:req.body.name,
        email:req.body.email,
        password:hash
    })
    await user.save();
    res.json({success:"Successfully Registered"});
} catch (error) {
    res.status(401).json({erros:error});
}
}
);
router.post('/login',[body('email').isEmail(),body('password').isLength({ min: 5 })],async(req,res)=>{
    try {
        const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let user=await User.findOne({email:req.body.email});
      if(!user){
          return res.status(402).json({errors:"Wrong Credentials"});
      }
      const compare=bcrypt.compareSync(req.body.password,user.password);
      if(!compare){
          return res.status(402).json({errors:"Wrong Password"});
      }
      const data={
          user:{
              id:user.id,
              email:req.body.email
          }
      };
      const token=jwt.sign(data,JWT_SIGN);
      res.json({success:"Logged In Successfully",token});
        
    } catch (error) {
        res.status(401).json({errors:error});
    }
});
router.post('/getuser',async(req,res)=>{
    try {
        let user=await User.findById(req.body.id,).select("-password");
        if(!user){
            res.status(401).json({errors:"Some error occured"});
        }
        res.json({user});
    } catch (error) {
        res.status(401).json({errors:error});
    }
})
router.post('/getuserbymail',async(req,res)=>{
    try {
        let user=await User.find({email:req.body.email}).select('-password');
        if(!user){
            return res.status(401).json({errors:"No user with this email exists"});
        }
        res.json(user);
    } catch (error) {
        res.status(401).json({errors:error});
    }
})
module.exports=router;