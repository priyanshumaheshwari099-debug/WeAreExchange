const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        default: ""
    },

    password: {
        type: String,
        default: ""
    },

    state: {
        type: String,
        default: ""
    },

    city: {
        type: String,
        default: ""
    },

    profileImage: {
        type: String,
        default: ""
    },

    googleId: {
        type: String,
        default: ""
    },

    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;