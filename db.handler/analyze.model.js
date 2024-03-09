const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const analyzeSchema = new Schema({
    text: {
        type: String,
        required: true
    },

    ownerId: {
        type: Schema.Types.UUID,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    result: {
        type: Number,
        required: true
    },

    evaluation: {
        type: Array,
        default: []
    }

});

const analyzeModel = mongoose.model("Analyze", analyzeSchema);

module.exports = analyzeModel;
