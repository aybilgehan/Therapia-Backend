const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uuid = require('uuid');

const userSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: uuid.v4
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: "user"
    },

    region: {
        type: String,
        default: "tr"
    },

    information: {
        type: Object
    }

});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
