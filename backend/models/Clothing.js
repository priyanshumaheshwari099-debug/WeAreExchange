const mongoose = require("mongoose");

const clothingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    brand: String,

    size: {
        type: String,
        required: true
    },

    condition: {
        type: String,
        required: true
    },

    conditionDescription: {
        type: String,
        required: true
    },

    value: Number,

    description: {
        type: String,
        required: true
    },

    country: {
        type: String,
        default: "India"
    },

    state: String,

    city: String,

    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    images: {
        type: [String],
        default: []
    },

    status: {
        type: String,
        default: "available"
    }

}, { timestamps: true });

module.exports = mongoose.model("Clothing", clothingSchema);