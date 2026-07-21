import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import helmet from "helmet"
import morgan from "morgan";
import { APIError } from "./src/utils/apiError.js";
import { errorMiddleware } from "./src/middleware/error.middleware.js"

// webhookhandler for payments
import { webhookHandler } from "./src/controllers/payment.controller.js";

// Routes
import healthCheckRouter from "./src/routes/healthCheck.route.js";
import adminRouter from "./src/routes/admin.route.js"
import userRouter from "./src/routes/user.route.js"
import paymentRouter from "./src/routes/payment.route.js"
import productRouter from "./src/routes/product.route.js"
import reviewRouter from "./src/routes/review.route.js"
import sellerRouter from "./src/routes/seller.route.js"
import siteContentRouter from "./src/routes/siteContent.route.js"
import cityAdminRouter from "./src/routes/cityAdmin.route.js"

const app = express();

app.use(helmet());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

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

app.post(
    "/api/v1/payment/webhook",
    express.raw({ type: "application/json" }),
    webhookHandler
);

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ extended: true, limit: "5mb", }));

app.use(cookieParser());

app.use(express.static("public"));


// Routes Declaration
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/cityAdmin", cityAdminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/siteContent", siteContentRouter);

app.use(errorMiddleware);

export { app };


