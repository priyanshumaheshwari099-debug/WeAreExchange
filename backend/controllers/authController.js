const bcrypt = require("bcryptjs");
const { getAuth } = require("firebase-admin/auth");
const firebaseAdmin = require("../config/firebaseAdmin");
const User = require("../models/User");

const signupUser = async(req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            state,
            city,
            googleId,
            profileImage,
            authProvider
        } = req.body;

        if (!name || !email || !phone || !password || !state || !city) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { phone }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email or mobile number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone,
            password: hashedPassword,
            state,
            city,
            googleId: googleId || "",
            profileImage: profileImage || "",
            authProvider: authProvider === "google" ? "google" : "local"
        });

        return res.status(201).json({
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                state: user.state,
                city: user.city,
                profileImage: user.profileImage,
                googleId: user.googleId,
                authProvider: user.authProvider
            }
        });

    } catch (error) {
        console.log("SIGNUP ERROR:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.password) {
            return res.status(401).json({
                message: "This account uses Google Login"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                state: user.state,
                city: user.city,
                profileImage: user.profileImage || "",
                googleId: user.googleId || "",
                authProvider: user.authProvider
            }
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


const googleLogin = async(req, res) => {
    try {
        const { credential, profileImage } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        const decodedToken = await getAuth(firebaseAdmin)
            .verifyIdToken(credential);
        console.log("GOOGLE DECODED TOKEN:", decodedToken);

        const {
            uid,
            email,
            name,
            picture
        } = decodedToken;

        if (!email) {
            return res.status(400).json({
                message: "Google email not found"
            });
        }

        const image = profileImage || picture || "";

        let existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {

            if (!existingUser.profileImage && image) {
                existingUser.profileImage = image;
                await existingUser.save();
            }

            return res.status(200).json({
                message: "Welcome back!",
                existingUser: true,
                user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    phone: existingUser.phone,
                    state: existingUser.state,
                    city: existingUser.city,
                    profileImage: existingUser.profileImage || image,
                    googleId: existingUser.googleId || uid,
                    authProvider: existingUser.authProvider
                }
            });
        }

        const user = await User.create({
            name: name || "",
            email: email.toLowerCase().trim(),
            phone: "",
            password: "",
            state: "",
            city: "",
            googleId: uid,
            profileImage: image,
            authProvider: "google"
        });

        return res.status(201).json({
            message: "Google account created",
            existingUser: false,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                state: user.state,
                city: user.city,
                profileImage: user.profileImage,
                googleId: user.googleId,
                authProvider: user.authProvider
            }
        });

    } catch (error) {
        console.log("GOOGLE LOGIN ERROR:", error);

        return res.status(401).json({
            message: "Google authentication failed"
        });
    }
};


const updateProfile = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, state, city } = req.body;

        if (!name || !phone || !state || !city) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const user = await User.findByIdAndUpdate(
            id, {
                name: name.trim(),
                phone: phone.trim(),
                state: state.trim(),
                city: city.trim()
            }, {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                state: user.state,
                city: user.city,
                profileImage: user.profileImage || "",
                googleId: user.googleId || "",
                authProvider: user.authProvider
            }
        });

    } catch (error) {
        console.log("UPDATE PROFILE ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    signupUser,
    loginUser,
    googleLogin,
    updateProfile
};