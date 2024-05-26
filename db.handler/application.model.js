const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const applicationSchema = new Schema({
    userId: {
        type: Schema.Types.UUID,
        required: true
    },

    information: {
        type: Object
    },

    photo: {
        type: String
    },

    document: {
        type: Array,
        default: []
    },

    approved: {
        type: Boolean,
        default: false
    }

});

const applicationModel = mongoose.model("Application", applicationSchema);

module.exports = applicationModel;
