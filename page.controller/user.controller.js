const User = require('../db.handler/user.model');
const Analyze = require('../db.handler/analyze.model');
const Application = require('../db.handler/application.model');


exports.updateInformation = async (req, res) => {
    try {
        await User.findOneAndUpdate(
            { userId: req.session.userId },
            { information: JSON(req.body) },
            { new: true }
        );

        res.status(200).send({ message: "Information updated" });
    } catch (error) {
        res.status(500).send({ message: error });
    }
}

exports.getResults = async (req, res) => {
    try {
        let results = await Analyze.findOne({ ownerId: req.session.userId });
        res.status(200).send({ data: results });
    } catch (error) {
        res.status(500).send({ message: error });
    }
}

/* exports.apply = async (req, res) => {
    try {
        if () 
    }
} */