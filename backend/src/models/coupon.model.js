import mongoose from "mongoose";


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },

    discountValue: {
        type: Number,
        required: true,
        min: 0
    },

    minimumOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },

    expiresAt: {
        type: Date,
        required: true
    },

    scope: {
        type: String,
        enum: ["GLOBAL", "CITY"],
        required: true,
    },

    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        default: null,
    },

    isActive: {
        type: Boolean,
        default: true
    },

    usageLimit: {
        type: Number,
        default: 1
    },

    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const Coupon = mongoose.model("Coupon", couponSchema);
