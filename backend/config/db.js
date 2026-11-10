const mongoose = require("mongoose")
const connectDB = async() => {
    try {
        await mongoose.connect("mongodb://localhost:27017/WearExchange")
        console.log("MongoDataBase connected Successfully🥳")
    } catch {
        console.log("MongoDataBase connection Failed")
        console.log(error.message)
    }
}
module.exports = connectDB