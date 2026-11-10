const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    swapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Swap",
        required: true
    },

    sender: {
        type: String,
        required: true
    },

    receiver: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Message", messageSchema);