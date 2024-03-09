const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    writerId: {
        type: Schema.Types.UUID,
        required: true
    },

    header: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    }

});

const articleModel = mongoose.model("Article", articleSchema);

module.exports = articleModel;
