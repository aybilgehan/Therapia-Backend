const Application = require('../db.handler/application.model');
const User = require('../db.handler/user.model');
require('dotenv').config();
const Request = require('request');


exports.analyze = async (req, res) => {
    console.log("geldi")
    try {
        Request.post({
            url : process.env.ANALYZE_URL,
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                key: "fac5cc77-c065-4c1d-9878-c11acc5e9c30",
                text : req.body.text
            })
        }, (error, response, body) => {
            console.log(error, body, response)
            if (error) {
                console.log(error);
                res.send({error : "An error occured"});
            }
            res.send(body);
        });
    } catch (error) {
        console.log(error);
        res.send({error : "An error occured"});
    }
}

