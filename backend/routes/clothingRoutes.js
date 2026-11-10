const express = require("express");
const multer = require("multer");
const path = require("path");
const Clothing = require("../models/Clothing");

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// ADD CLOTHING
router.post("/", upload.array("images"), async(req, res) => {
    try {
        const images = req.files ?
            req.files.map(file => `/uploads/${file.filename}`) :
            [];

        const clothing = await Clothing.create({
            ...req.body,
            images
        });

        res.status(201).json({
            message: "Clothing added successfully",
            clothing
        });

    } catch (error) {
        console.log("CLOTHING ERROR:", error);

        res.status(500).json({
            message: "Failed to add clothing",
            error: error.message
        });
    }
});

// ALL CLOTHING
router.get("/", async(req, res) => {
    try {
        const clothes = await Clothing.find({
            status: "available"
        }).sort({
            createdAt: -1
        });

        res.status(200).json(clothes);

    } catch (error) {
        console.log("GET CLOTHING ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch clothing",
            error: error.message
        });
    }
});

// SEARCH MY CLOTHING
router.get("/my/:userId/search", async(req, res) => {
    try {
        const {
            q = "",
                page = 1,
                limit = 20
        } = req.query;

        const currentPage = Number(page);
        const currentLimit = Number(limit);
        const skip = (currentPage - 1) * currentLimit;

        const search = {
            userId: req.params.userId,
            status: "available"
        };

        if (q.trim()) {
            search.$or = [{
                    title: {
                        $regex: q.trim(),
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: q.trim(),
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: q.trim(),
                        $options: "i"
                    }
                }
            ];
        }

        const [clothes, total] = await Promise.all([
            Clothing.find(search)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(currentLimit),

            Clothing.countDocuments(search)
        ]);

        res.status(200).json({
            clothes,
            total,
            page: currentPage,
            pages: Math.ceil(total / currentLimit)
        });

    } catch (error) {
        console.log(
            "SEARCH MY CLOTHING ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to search clothing",
            error: error.message
        });
    }
});

// MY LISTINGS
router.get("/my/:userId", async(req, res) => {
    try {
        const clothes = await Clothing.find({
            userId: req.params.userId
        }).sort({
            createdAt: -1
        });

        res.status(200).json(clothes);

    } catch (error) {
        console.log(
            "MY LISTINGS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch your listings",
            error: error.message
        });
    }
});

// SINGLE CLOTHING
router.get("/:id", async(req, res) => {
    try {
        const clothing = await Clothing.findById(
            req.params.id
        );

        if (!clothing) {
            return res.status(404).json({
                message: "Clothing not found"
            });
        }

        res.status(200).json(clothing);

    } catch (error) {
        console.log(
            "GET SINGLE CLOTHING ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch clothing",
            error: error.message
        });
    }
});

// UPDATE CLOTHING
router.put(
    "/:id",
    upload.array("images"),
    async(req, res) => {
        try {
            const clothing = await Clothing.findById(
                req.params.id
            );

            if (!clothing) {
                return res.status(404).json({
                    message: "Clothing not found"
                });
            }

            if (
                clothing.userId !== req.body.userId
            ) {
                return res.status(403).json({
                    message: "You can only edit your own listing"
                });
            }

            const updateData = {
                ...req.body
            };

            if (req.files && req.files.length > 0) {
                updateData.images = req.files.map(
                    file => `/uploads/${file.filename}`
                );
            }

            const updatedClothing =
                await Clothing.findByIdAndUpdate(
                    req.params.id,
                    updateData, {
                        new: true,
                        runValidators: true
                    }
                );

            res.status(200).json({
                message: "Listing updated successfully",
                clothing: updatedClothing
            });

        } catch (error) {
            console.log(
                "UPDATE CLOTHING ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to update clothing",
                error: error.message
            });
        }
    }
);

// DELETE CLOTHING
router.delete("/:id", async(req, res) => {
    try {
        const clothing = await Clothing.findById(
            req.params.id
        );

        if (!clothing) {
            return res.status(404).json({
                message: "Clothing not found"
            });
        }

        if (
            clothing.userId !== req.body.userId
        ) {
            return res.status(403).json({
                message: "You can only delete your own listing"
            });
        }

        await Clothing.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message: "Listing deleted successfully"
        });

    } catch (error) {
        console.log(
            "DELETE CLOTHING ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to delete clothing",
            error: error.message
        });
    }
});

module.exports = router;