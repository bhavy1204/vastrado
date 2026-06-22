import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import helmet from "helmet"
import morgan from "morgan";
import { APIError } from "./src/utils/apiError.js";


const app = express();

app.use(helmet());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new APIError(403, `CORS blocked ortigin : ${origin}`))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ extended: true, limit: "5mb", }));

app.use(cookieParser());

app.use(express.static("public"));

// Routes
import healthCheckRouter from "./src/routes/healthCheck.route.js";


// Routes Declaration
app.use("/api/v1/healthCheck", healthCheckRouter);



app.use((err, req, res, next) => {
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
        })
    }

    // mongooser validation error
    if (err.name === "ValidationError") {
        const erros = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: "Validation error",
            erros,
        });
    }

    // mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            errors: [],
        });
    }

    console.error("Unhandled error : ", err);
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    })
});

export { app };