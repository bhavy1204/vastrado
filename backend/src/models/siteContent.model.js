import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        redirectUrl: {
            type: String,
            trim: true,
        },

        scope: {
            type: String,
            enum: ["GLOBAL", "CITY", "SELLER"],
            required: true,
        },

        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            default: null,
        },

        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            default: null,
        },

        isSponsored: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        order: {
            type: Number,
            default: 0,
        },

        expiresAt: {
            type: Date,
            default: null,
        },
    }, { timestamps: true }
);

heroBannerSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String, required: true
        },
        answer: {
            type: String, required: true
        },
    },
    { timestamps: true }
);

const HeroBanner = mongoose.model("HeroBanner", heroBannerSchema);
const Faq = mongoose.model("Faq", faqSchema);

export { HeroBanner, Faq };