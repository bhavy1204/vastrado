import dotenv from "dotenv"

dotenv.config({ path: "./.env" })

import connectDB from "./src/db/dbConnection.js"
import { app } from "./app.js"
import mongoose from "mongoose";

let server;

connectDB().then(() => {
    server = app.listen(process.env.PORT || 3000, () => {
        console.log(`Server up and running on port ${process.env.PORT || 3000}`);
    })

    server.on("error", (err) => {
        console.error("Server error : ", err);
        process.exit(1);
    })
}).catch((err) => {
    console.error("Fail to connect DB, server not started :", err.message);
})

const gracefulShutdown = (signal) => {
    console.log(`${signal} recived, shutting down `);

    server.close(() => {
        console.log("HTTP sertver closed");
    })
    mongoose.connection.close().then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
    })

    // force kill\
    setTimeout(() => {
        console.error("Force shutting down");
        process.exit(1);
    }, 15000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("UnhandledRejection", (reason, promise) => {
    console.error(`Unhandled rejection at ${promise} \n Reason : ${reason}`);
    gracefulShutdown("unhandledRejection")
})

process.on("uncaughtException", (err) => {
    console.error("Uncaugght exception , ", err);
    process.exit(1);
})





