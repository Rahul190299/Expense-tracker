require('dotenv').config()
const express = require('express')
const connectToMongo=require('./db/db');
var cors = require('cors')
const app = express()
const port = process.env.PORT ||5000;
app.use(cors())
app.use(express.json());
connectToMongo();
app.use('/auth',require('./routes/auth'));
app.use('/transact',require('./routes/transactions'));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})