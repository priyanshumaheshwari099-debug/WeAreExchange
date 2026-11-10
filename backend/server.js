require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const clothingRoutes = require("./routes/clothingRoutes");
const swappingRoutes = require("./routes/swappingRoutes");
const messageRoutes = require("./routes/messageRoutes");

const Port = 5000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/clothing", clothingRoutes);
app.use("/api/swapping", swappingRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    res.send("WearExchange Backend is running");
});

app.get("/api/auth/test", (req, res) => {
    res.send("Auth route working");
});

app.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
});