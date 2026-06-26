import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        title: String,
        description: String,
        redirectUrl: String,
        isSponsored: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        order: { type: Number, default: 0 },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
        },
        expiresAt: Date,
    },
    { timestamps: true }
);

const faqSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
    },
    { timestamps: true }
);

const HeroBanner = mongoose.model("HeroBanner", heroBannerSchema);
const Faq = mongoose.model("Faq", faqSchema);

export { HeroBanner, Faq };