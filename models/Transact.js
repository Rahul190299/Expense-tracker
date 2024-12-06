const mongoose=require('mongoose');
const { Schema } = mongoose;

const Transact = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
  nextUser:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  amount:{
      type:Number,
      required:true
  },
  status:{
      type:String,
      required:true
  },
  date:{
      type:Date,
      default:Date.now
  }
});
module.exports=mongoose.model('transaction',Transact);