const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Swap = require("../models/Swapping");
const Clothing = require("../models/Clothing");
const User = require("../models/User");

const isParticipant = (swap, userId) =>
    Boolean(userId) &&
    (
        String(swap.requester) === String(userId) ||
        String(swap.owner) === String(userId)
    );

const roleOf = (swap, userId) =>
    String(swap.requester) === String(userId) ?
    "requester" :
    "owner";

const acceptedSwap = async(id, userId, res) => {
    if (!mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(userId)
    ) {
        res.status(400).json({
            message: "Invalid swap or user ID"
        });
        return null;
    }

    const swap = await Swap.findById(id);

    if (!swap) {
        res.status(404).json({
            message: "Swap not found"
        });
        return null;
    }

    if (!isParticipant(swap, userId)) {
        res.status(403).json({
            message: "Not authorized"
        });
        return null;
    }

    if (!["accepted", "completed"].includes(swap.status)) {
        res.status(400).json({
            message: "Swap is not accepted"
        });
        return null;
    }

    return swap;
};

// SEND SWAP REQUEST
router.post("/request", async(req, res) => {
    try {
        const {
            requester,
            offeredItem,
            requestedItem
        } = req.body;

        if (!mongoose.isValidObjectId(requester) ||
            !mongoose.isValidObjectId(offeredItem) ||
            !mongoose.isValidObjectId(requestedItem)
        ) {
            return res.status(400).json({
                message: "Invalid request details"
            });
        }

        const [offered, requested] = await Promise.all([
            Clothing.findById(offeredItem),
            Clothing.findById(requestedItem)
        ]);

        if (!offered || !requested) {
            return res.status(404).json({
                message: "Clothing item not found"
            });
        }

        if (String(offered.userId) !== String(requester)) {
            return res.status(403).json({
                message: "You can only offer your own clothing"
            });
        }

        if (String(requested.userId) === String(requester)) {
            return res.status(400).json({
                message: "You cannot swap your own clothing"
            });
        }

        if (
            offered.status !== "available" ||
            requested.status !== "available"
        ) {
            return res.status(400).json({
                message: "Clothing is no longer available"
            });
        }

        const existing = await Swap.findOne({
            requester,
            offeredItem,
            requestedItem,
            status: "pending"
        });

        if (existing) {
            return res.status(400).json({
                message: "Request already sent"
            });
        }

        const swap = await Swap.create({
            requester,
            owner: String(requested.userId),
            offeredItem,
            requestedItem
        });

        return res.status(201).json({
            message: "Swap request sent",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// RECEIVED PENDING REQUESTS
router.get("/received/:userId", async(req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const swaps = await Swap.find({
                owner: userId,
                status: "pending"
            })
            .populate("offeredItem")
            .populate("requestedItem")
            .sort({ createdAt: -1 });

        return res.json(swaps);
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// ACCEPT SWAP
router.patch("/accept/:id", async(req, res) => {
    try {
        const { userId } = req.body;

        if (!mongoose.isValidObjectId(req.params.id) ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(400).json({
                message: "Invalid swap or user ID"
            });
        }

        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({
                message: "Swap not found"
            });
        }

        if (String(swap.owner) !== String(userId)) {
            return res.status(403).json({
                message: "Only the listing owner can accept"
            });
        }

        if (swap.status !== "pending") {
            return res.status(400).json({
                message: "Request already processed"
            });
        }

        const [offered, requested] = await Promise.all([
            Clothing.findById(swap.offeredItem),
            Clothing.findById(swap.requestedItem)
        ]);

        if (!offered ||
            !requested ||
            offered.status !== "available" ||
            requested.status !== "available"
        ) {
            return res.status(400).json({
                message: "Clothing is no longer available"
            });
        }

        swap.status = "accepted";
        await swap.save();

        await Promise.all([
            Clothing.findByIdAndUpdate(swap.offeredItem, {
                status: "swapped"
            }),
            Clothing.findByIdAndUpdate(swap.requestedItem, {
                status: "swapped"
            })
        ]);

        return res.json({
            message: "Swap accepted",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// REJECT SWAP
router.patch("/reject/:id", async(req, res) => {
    try {
        const { userId } = req.body;

        if (!mongoose.isValidObjectId(req.params.id) ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(400).json({
                message: "Invalid swap or user ID"
            });
        }

        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({
                message: "Swap not found"
            });
        }

        if (String(swap.owner) !== String(userId)) {
            return res.status(403).json({
                message: "Only the listing owner can reject"
            });
        }

        if (swap.status !== "pending") {
            return res.status(400).json({
                message: "Request already processed"
            });
        }

        swap.status = "rejected";
        await swap.save();

        await Promise.all([
            Clothing.findByIdAndUpdate(swap.offeredItem, {
                status: "available"
            }),
            Clothing.findByIdAndUpdate(swap.requestedItem, {
                status: "available"
            })
        ]);

        return res.json({
            message: "Swap rejected",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});
/* SELECT DELIVERY METHOD: LISTING OWNER */
router.patch("/delivery-method/:id", async(req, res) => {
    try {
        const { userId, method } = req.body;
        const swap = await acceptedSwap(req.params.id, userId, res);
        if (!swap) return;

        if (swap.status !== "accepted") {
            return res.status(400).json({
                message: "Swap already completed"
            });
        }

        if (String(swap.owner) !== String(userId)) {
            return res.status(403).json({
                message: "Only the listing owner can select the method"
            });
        }

        if (!["local", "shipping"].includes(method)) {
            return res.status(400).json({
                message: "Choose local or shipping"
            });
        }

        if (swap.deliveryMethod && swap.deliveryMethod !== method) {
            return res.status(400).json({
                message: "Delivery method already selected"
            });
        }

        swap.deliveryMethod = method;
        swap.deliveryMethodSelectedBy = String(userId);
        swap.deliveryMethodConfirmedBy = null;
        await swap.save();

        return res.json({
            message: "Delivery method selected; waiting for other user",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* CONFIRM DELIVERY METHOD: OTHER PARTICIPANT */
router.patch("/delivery-confirm/:id", async(req, res) => {
    try {
        const { userId } = req.body;
        const swap = await acceptedSwap(req.params.id, userId, res);
        if (!swap) return;

        if (swap.status !== "accepted") {
            return res.status(400).json({
                message: "Swap already completed"
            });
        }

        if (!swap.deliveryMethod) {
            return res.status(400).json({
                message: "No delivery method selected"
            });
        }

        if (String(swap.deliveryMethodSelectedBy) === String(userId)) {
            return res.status(400).json({
                message: "Other user must confirm"
            });
        }

        if (swap.deliveryMethodConfirmedBy) {
            return res.status(400).json({
                message: "Delivery method already confirmed"
            });
        }

        swap.deliveryMethodConfirmedBy = String(userId);
        await swap.save();

        return res.json({
            message: "Delivery method confirmed",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* SAVE SHIPPING ADDRESS */
router.patch("/shipping-address/:id", async(req, res) => {
    try {
        const { userId, address } = req.body;
        const swap = await acceptedSwap(req.params.id, userId, res);
        if (!swap) return;

        if (
            swap.status !== "accepted" ||
            swap.deliveryMethod !== "shipping" ||
            !swap.deliveryMethodConfirmedBy
        ) {
            return res.status(400).json({
                message: "Shipping method must be confirmed first"
            });
        }

        if (!address ||
            !address.firstName ?.trim() ||
            !address.lastName ?.trim() ||
            !address.street ?.trim() ||
            !address.city ?.trim() ||
            !address.state ?.trim() ||
            !address.pincode ?.trim() ||
            !address.phone ?.trim()
        ) {
            return res.status(400).json({
                message: "Complete all required address fields"
            });
        }

        if (!/^[1-9]\d{5}$/.test(address.pincode)) {
            return res.status(400).json({
                message: "PIN code must contain 6 digits"
            });
        }

        if (!/^[6-9]\d{9}$/.test(address.phone)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit Indian mobile number"
            });
        }

        const role = roleOf(swap, userId);

        swap.shippingDetails[role] = {
            firstName: address.firstName.trim(),
            lastName: address.lastName.trim(),
            email: (address.email || "").trim(),
            street: address.street.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            pincode: address.pincode.trim(),
            country: "India",
            phone: address.phone.trim(),
            confirmed: true
        };

        swap.markModified("shippingDetails");
        await swap.save();

        return res.json({
            message: "Shipping address saved",
            role,
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* SAVE LOCAL MEETING PROPOSAL */
router.patch("/meeting-details/:id", async(req, res) => {
    try {
        const { userId, location, date, time } = req.body;
        const swap = await acceptedSwap(req.params.id, userId, res);
        if (!swap) return;

        if (
            swap.status !== "accepted" ||
            swap.deliveryMethod !== "local" ||
            !swap.deliveryMethodConfirmedBy
        ) {
            return res.status(400).json({
                message: "Confirm local delivery first"
            });
        }

        if (!location ?.trim() || !date || !time ?.trim()) {
            return res.status(400).json({
                message: "Location, date and time required"
            });
        }

        const meetingDate = new Date(date);

        if (Number.isNaN(meetingDate.getTime())) {
            return res.status(400).json({
                message: "Invalid meeting date"
            });
        }

        swap.meetingDetails.location = location.trim();
        swap.meetingDetails.date = meetingDate;
        swap.meetingDetails.time = time.trim();
        swap.meetingDetails.proposedBy = String(userId);
        swap.meetingDetails.confirmedBy = null;

        swap.markModified("meetingDetails");
        await swap.save();

        return res.json({
            message: "Meeting proposed",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* CONFIRM LOCAL MEETING */
router.patch("/meeting-confirm/:id", async(req, res) => {
    try {
        const { userId } = req.body;
        const swap = await acceptedSwap(req.params.id, userId, res);
        if (!swap) return;

        if (
            swap.status !== "accepted" ||
            swap.deliveryMethod !== "local" ||
            !swap.meetingDetails ?.proposedBy
        ) {
            return res.status(400).json({
                message: "No meeting proposed"
            });
        }

        if (String(swap.meetingDetails.proposedBy) === String(userId)) {
            return res.status(400).json({
                message: "Other user must confirm"
            });
        }

        if (swap.meetingDetails.confirmedBy) {
            return res.status(400).json({
                message: "Meeting already confirmed"
            });
        }

        swap.meetingDetails.confirmedBy = String(userId);
        await swap.save();

        return res.json({
            message: "Meeting confirmed",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* UPDATE OWN SHIPMENT */
router.patch("/tracking/:id", async(req, res) => {
    try {
        const { userId, courier, trackingId, status } = req.body;
        const swap = await acceptedSwap(req.params.id, userId, res);
        if (!swap) return;

        if (swap.status !== "accepted") {
            return res.status(400).json({
                message: "Swap already completed"
            });
        }

        if (
            swap.deliveryMethod !== "shipping" ||
            !swap.deliveryMethodConfirmedBy
        ) {
            return res.status(400).json({
                message: "Confirm shipping first"
            });
        }

        const role = roleOf(swap, userId);

        if (!swap.shippingDetails ?.[role] ?.confirmed) {
            return res.status(400).json({
                message: "Save your shipping address first"
            });
        }

        if (status !== "Shipped") {
            return res.status(400).json({
                message: "Only Shipped status is allowed"
            });
        }

        if (!courier ?.trim() || !trackingId ?.trim()) {
            return res.status(400).json({
                message: "Courier and tracking ID required"
            });
        }

        swap.trackingDetails[role].courier = courier.trim();
        swap.trackingDetails[role].trackingId = trackingId.trim();
        swap.trackingDetails[role].status = "Shipped";

        swap.markModified("trackingDetails");
        await swap.save();

        return res.json({
            message: "Your parcel is marked as shipped",
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* RECEIVER CONFIRMS INCOMING PARCEL */
router.patch("/delivery-received/:id", async(req, res) => {
    try {
        const { userId } = req.body;
        const swap = await acceptedSwap(req.params.id, userId, res);
        if (!swap) return;

        if (swap.status !== "accepted") {
            return res.status(400).json({
                message: "Swap already completed"
            });
        }

        if (!swap.deliveryMethod || !swap.deliveryMethodConfirmedBy) {
            return res.status(400).json({
                message: "Confirm delivery method first"
            });
        }

        const receiverRole = roleOf(swap, userId);

        if (swap.deliveryConfirmations ?.[receiverRole]) {
            return res.status(400).json({
                message: "You have already confirmed receipt"
            });
        }

        if (swap.deliveryMethod === "shipping") {
            const senderRole =
                receiverRole === "requester" ? "owner" : "requester";

            const incoming = swap.trackingDetails ?.[senderRole];

            if (incoming ?.status !== "Shipped") {
                return res.status(400).json({
                    message: "The other user must mark their parcel as shipped first"
                });
            }

            incoming.status = "Delivered";
            swap.markModified("trackingDetails");
        } else if (swap.deliveryMethod === "local") {
            if (!swap.meetingDetails ?.confirmedBy) {
                return res.status(400).json({
                    message: "Meeting must be confirmed first"
                });
            }
        }

        swap.deliveryConfirmations[receiverRole] = true;

        const bothReceived =
            Boolean(swap.deliveryConfirmations.requester) &&
            Boolean(swap.deliveryConfirmations.owner);

        if (bothReceived) {
            swap.status = "completed";
        }

        swap.markModified("deliveryConfirmations");
        await swap.save();

        let receiverName = "A participant";

        try {
            const receiver = await User.findById(userId).select("name displayName");
            receiverName =
                receiver ?.name ||
                receiver ?.displayName ||
                "A participant";
        } catch (userError) {
            console.error("Could not fetch receiver name:", userError.message);
        }

        return res.json({
            message: bothReceived ?
                "Both users confirmed receipt. Swap completed!" : "Your receipt is confirmed. Waiting for the other user.",
            receivedBy: userId,
            receiverName,
            receiverRole,
            bothReceived,
            swap
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* DELIVERY OVERVIEW: ACCEPTED AND COMPLETED SWAPS */
router.get("/user-deliveries/:userId", async(req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const swaps = await Swap.find({
                $or: [
                    { requester: userId },
                    { owner: userId }
                ],
                status: {
                    $in: ["accepted", "completed"]
                }
            })
            .populate("offeredItem")
            .populate("requestedItem")
            .sort({ updatedAt: -1 });

        return res.json(swaps);
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* ONLY COMPLETED SWAPS */
router.get("/completed/:userId", async(req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const swaps = await Swap.find({
                $or: [
                    { requester: userId },
                    { owner: userId }
                ],
                status: "completed"
            })
            .populate("offeredItem")
            .populate("requestedItem")
            .sort({ updatedAt: -1 });

        return res.json(swaps);
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

/* GET A SINGLE SWAP */
router.get("/:id", async(req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid swap ID"
            });
        }

        const swap = await Swap.findById(req.params.id)
            .populate("offeredItem")
            .populate("requestedItem");

        if (!swap) {
            return res.status(404).json({
                message: "Swap not found"
            });
        }

        return res.json(swap);
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = router;