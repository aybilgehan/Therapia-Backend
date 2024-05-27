const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const analyzeSchema = new Schema({
    _id: {
        type: Schema.Types.UUID
    },

    text: {
        type: String,
        required: true
    },
    ownerId: {
        type: Schema.Types.UUID,
    },
    email: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now
    },

    result: {
        type: Number,
        required: true
    },

    evaluationPermission: {
        type: Boolean,
        default: false
    },

    evaluation: {
        type: Object
    }
});

const analyzeModel = mongoose.model("Analyze", analyzeSchema);

module.exports = analyzeModel;
