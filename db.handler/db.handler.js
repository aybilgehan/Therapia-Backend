const mongoose = require('mongoose');
require('dotenv').config();
const { exit } = require('process');


exports.connect = async function () {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('DB connection is set.')
    }).catch((error) => {
        console.log(error);
        exit(console.log("DB connection is not set."));
    });
} 
