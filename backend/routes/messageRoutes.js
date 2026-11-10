const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const Swap = require("../models/Swapping");
const User = require("../models/User");

// ============================================
// UNREAD MESSAGE COUNT
// ============================================
router.get("/unread/:userId", async(req, res) => {
    try {
        const { userId } = req.params;

        const count = await Message.countDocuments({
            receiver: userId,
            read: false
        });

        return res.status(200).json({ count });
    } catch (error) {
        console.error("UNREAD COUNT ERROR:", error);

        return res.status(500).json({
            message: "Failed to get unread messages",
            error: error.message
        });
    }
});

// ============================================
// MARK MESSAGES AS READ
// ============================================
router.patch("/read/:swapId/:userId", async(req, res) => {
    try {
        const { swapId, userId } = req.params;

        const swap = await Swap.findById(swapId);

        if (!swap) {
            return res.status(404).json({
                message: "Swap request not found"
            });
        }

        if (
            String(swap.requester) !== String(userId) &&
            String(swap.owner) !== String(userId)
        ) {
            return res.status(403).json({
                message: "You are not part of this swap"
            });
        }

        await Message.updateMany({
            swapId,
            receiver: userId,
            read: false
        }, {
            $set: { read: true }
        });

        return res.status(200).json({
            message: "Messages marked as read"
        });
    } catch (error) {
        console.error("MARK READ ERROR:", error);

        return res.status(500).json({
            message: "Failed to mark messages as read",
            error: error.message
        });
    }
});

// ============================================
// GET CHAT MESSAGES
// ============================================
router.get("/:swapId", async(req, res) => {
    try {
        const { swapId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const swap = await Swap.findById(swapId);

        if (!swap) {
            return res.status(404).json({
                message: "Swap request not found"
            });
        }

        if (
            String(swap.requester) !== String(userId) &&
            String(swap.owner) !== String(userId)
        ) {
            return res.status(403).json({
                message: "You are not part of this swap"
            });
        }

        const otherUserId =
            String(swap.requester) === String(userId) ?
            swap.owner :
            swap.requester;

        const otherUser = await User.findById(otherUserId)
            .select("name profileImage");

        const messages = await Message.find({
            swapId
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            messages,
            otherUser
        });
    } catch (error) {
        console.error("GET CHAT ERROR:", error);

        return res.status(500).json({
            message: "Failed to load chat",
            error: error.message
        });
    }
});

// ============================================
// SEND MESSAGE
// ============================================
router.post("/", async(req, res) => {
    try {
        const { swapId, sender, message } = req.body;

        if (!swapId ||
            !sender ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        const swap = await Swap.findById(swapId);

        if (!swap) {
            return res.status(404).json({
                message: "Swap request not found"
            });
        }

        if (
            String(swap.requester) !== String(sender) &&
            String(swap.owner) !== String(sender)
        ) {
            return res.status(403).json({
                message: "You are not part of this swap"
            });
        }

        const receiver =
            String(swap.requester) === String(sender) ?
            swap.owner :
            swap.requester;

        const newMessage = await Message.create({
            swapId,
            sender,
            receiver,
            message: message.trim()
        });

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);

        return res.status(500).json({
            message: "Failed to send message",
            error: error.message
        });
    }
});

// ============================================
// GET USER CONVERSATIONS
// ============================================
router.get("/conversations/:userId", async(req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).sort({ createdAt: -1 });

        const conversationMap = new Map();

        for (const message of messages) {
            const otherUserId =
                String(message.sender) === String(userId) ?
                message.receiver :
                message.sender;

            const conversationKey = String(message.swapId);

            if (!conversationMap.has(conversationKey)) {
                conversationMap.set(conversationKey, {
                    swapId: conversationKey,
                    otherUserId,
                    lastMessage: message.message,
                    lastMessageTime: message.createdAt,
                    unread: 0
                });
            }
        }

        for (const item of conversationMap.values()) {
            item.unread = await Message.countDocuments({
                swapId: item.swapId,
                receiver: userId,
                read: false
            });
        }

        const conversations = [];

        for (const item of conversationMap.values()) {
            const otherUser = await User.findById(item.otherUserId)
                .select("name profileImage");

            conversations.push({
                ...item,
                otherUser
            });
        }

        return res.status(200).json(conversations);
    } catch (error) {
        console.error("CONVERSATIONS ERROR:", error);

        return res.status(500).json({
            message: "Failed to load conversations",
            error: error.message
        });
    }
});

// ============================================
// DELETE CONVERSATION
// ============================================

router.delete(
    "/conversations/:userId/:swapId",
    async(req, res) => {
        try {
            const { userId, swapId } = req.params;

            console.log("DELETE USER ID:", userId);
            console.log("DELETE SWAP ID:", swapId);

            if (!/^[a-fA-F0-9]{24}$/.test(userId) ||
                !/^[a-fA-F0-9]{24}$/.test(swapId)) {
                return res.status(400).json({
                    message: "Invalid user ID or swap ID"
                });
            }

            // Verify that this user has messages in this conversation.
            const hasMessages = await Message.exists({
                swapId,
                $or: [
                    { sender: userId },
                    { receiver: userId }
                ]
            });

            if (!hasMessages) {
                return res.status(404).json({
                    message: "No messages found for this user and conversation"
                });
            }

            // Delete messages only for this user and this conversation.
            const result = await Message.deleteMany({
                swapId,
                $or: [
                    { sender: userId },
                    { receiver: userId }
                ]
            });

            return res.status(200).json({
                message: "Conversation messages deleted successfully",
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error("DELETE CONVERSATION ERROR:", error);

            return res.status(500).json({
                message: "Failed to delete conversation",
                error: error.message
            });
        }
    }
);


module.exports = router;