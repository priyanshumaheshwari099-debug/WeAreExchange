const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
    phone: { type: String, default: "" },
    confirmed: { type: Boolean, default: false }
}, { _id: false });

const swapSchema = new mongoose.Schema({
    requester: { type: String, required: true },
    owner: { type: String, required: true },
    offeredItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clothing",
        required: true
    },
    requestedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clothing",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
        default: "pending"
    },

    deliveryMethod: {
        type: String,
        enum: ["local", "shipping", null],
        default: null
    },
    deliveryMethodSelectedBy: { type: String, default: null },
    deliveryMethodConfirmedBy: { type: String, default: null },

    meetingDetails: {
        location: { type: String, default: "" },
        date: { type: Date, default: null },
        time: { type: String, default: "" },
        proposedBy: { type: String, default: null },
        confirmedBy: { type: String, default: null }
    },

    shippingDetails: {
        requester: { type: addressSchema, default: () => ({}) },
        owner: { type: addressSchema, default: () => ({}) }
    },

    trackingDetails: {
        requester: {
            courier: { type: String, default: "" },
            trackingId: { type: String, default: "" },
            status: { type: String, default: "Not Shipped" }
        },
        owner: {
            courier: { type: String, default: "" },
            trackingId: { type: String, default: "" },
            status: { type: String, default: "Not Shipped" }
        }
    },

    deliveryConfirmations: {
        requester: { type: Boolean, default: false },
        owner: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model("Swap", swapSchema);