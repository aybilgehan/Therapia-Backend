const Analyze = require('../db.handler/analyze.model');
require('dotenv').config();
const Request = require('request');
const uuid = require('uuid');


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
            if (error) {
                console.log(error);
                res.send({error : "An error occured"});
            }
            body = JSON.parse(body);
            console.log(req.session.userId ? req.session.userId : null)
            Analyze.create({
                _id: uuid.v4(),
                text: req.body.text,
                ownerId: req.session.userId ? req.session.userId : null,
                result: body.result
            });
            res.send(body);
        });
    } catch (error) {
        console.log(error);
        res.send({error : "An error occured"});
    }
}

