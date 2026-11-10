const express = require("express");

const {
    signupUser,
    loginUser,
    googleLogin,
    updateProfile
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

router.put("/profile/:id", updateProfile);

module.exports = router;