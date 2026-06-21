import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
    const url = process.env.MONGODB_URL;

    if (!url) {
        console.error("MONGODB_URL is not defined");
        process.exit(1);
    }
    try {
        const connectionInstance = await mongoose.connect(url, {
            dbName: process.env.DB_NAME || "vastrado"
        });

        console.log("DB connection succcessful", connectionInstance.connection.host);

        mongoose.connection.on("disconnected", ()=>{
            console.warn("DB disconnected");
        })

        mongoose.connection.on("reconnected", ()=>{
            console.log("DB reconnected");
        })

        mongoose.connection.on("error", (err)=>{
            console.log("DB connection err : ", err);
        })


    } catch (error) {
        console.error("DB initial connection failed : ", error);
        process.exit(1);
    }
}

export default connectDB;


