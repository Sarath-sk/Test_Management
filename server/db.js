const mongoose = require('mongoose');
require('dotenv').config();

const URL = process.env.MONGODB_URI;



async function connectDB() {
    try{
        await mongoose.connect(URL);
        console.log("DB connected successfully.");
    }catch(error){
        console.log(error.message);
        process.exit(1);
    }
}


module.exports = connectDB
