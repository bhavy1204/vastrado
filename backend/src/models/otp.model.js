import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        purpose: {
            type: String,
            enum: [
                "forgot-password",
                "reset-password",
                "email-verification",
            ],
            required: true,
        },

        attempts: {
            type: Number,
            default: 0,
            max: 5
        },

        otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: {
                expires: 0, // TTL Index
            },
        },
    },
    {
        timestamps: true,
    }
);

otpSchema.index({ email: 1, purpose: 1 });

export const OTP = mongoose.model("OTP", otpSchema);