const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User=require('../models/User');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const JWT_SIGN=process.env.SECRETKEY;
const fetchuser=require('../middleware/fetchuser');
const req = require('express/lib/request');
const Transaction=require('../models/Transact');

//transaction looks like user has to pay next user
router.post('/createtotake',fetchuser,async(req,res)=>{
    try {
        
        let user=await User.findOne({email:req.body.email});
    
        if(!user  || (req.body.email===req.user.email)){
            return res.status(401).json({errors:"Enter the valid email"});
        }
        let transact=await Transaction.find({nextUser:req.user.id,user:user._id}).populate('user');

        if(transact.length!=0){
            transact[0].amount=transact[0].amount+Number(req.body.amount);
            await transact[0].save();
            res.json({success:"Successfully Added The Transaction",transact:transact[0]});
        }
        else{
         let newtransact=await new Transaction({
            user:user._id,
            nextUser:req.user.id,
            amount:req.body.amount,
            status:"topay"
        });
        await newtransact.save();
        newtransact.user=user;
        res.json({success:"Successfully Added The Transaction",transact:newtransact});
    }

    } catch (error) {
        res.status(401).json({errors:error});
    }
});
router.post('/totake',fetchuser,async(req,res)=>{
    try {
        
        let transact=await Transaction.find({nextUser:req.user.id,status:"topay"}).populate('user');
        
        if(!transact){
            return res.status(401).json({errors:"No Transaction Yet"});
        }
        res.json({transact});
    } catch (error) {
        res.status(401).json({errors:error});
    }
})
router.post('/paid',fetchuser,async(req,res)=>{
    try {
        let nextuser=await User.findOne({email:req.body.email});
        if(!nextuser){
            return res.status(401).json({errors:"Enter the valid email"});
        }
        let transact=await Transaction.findOne({user:req.user.id,nextUser:nextuser.id});
        if(!transact){
            res.status(401).json({errors:"No such Transaction"});
        }
        if(Number(req.body.amount)===transact.amount){
            let deletion=await Transaction.findByIdAndRemove(transact._id);
            if(!deletion){
                return res.status(401).json({errors:"Some Error Occured"});
            }
        }
        else{
            transact.amount=transact.amount-Number(req.body.amount);
            await transact.save();
        }
        res.json({success:"Paid Successfully",transact});
        
    } catch (error) {
        res.status(401).json({errors:error});
    }
})
router.post('/fetchalltransact',fetchuser,async(req,res)=>{ //this fetches all transacations of the user
    try {
        
        let transact=await Transaction.find({user:req.user.id}).populate('nextUser');
        if(!transact){
            return res.status(401).json({errors:"No transactions"})
        }
        res.json(transact); 
    } catch (error) {
        return res.status(401).json({errors:error})
    }
})

router.get('/fetchamount',fetchuser,async(req,res)=>{
    try{
        const uid=req.user.id;
        let Taketransact=await Transaction.find({nextUser:uid});
        let Paytransact=await Transaction.find({user:uid});
        let takeamount=0;
        let payamount=0;
        Taketransact.forEach((element)=>{
            takeamount+=element.amount;
        })
        Paytransact.forEach((element)=>{
            payamount+=element.amount;
        })
        res.json({takeamount,payamount});
    }
    catch(error){
        res.json({errors:"Some Error Occured"});    
    }
})
module.exports=router;