import mongoose from "mongoose";
import { Product } from "./product.model.js";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
    },
    { timestamps: true }
);

reviewSchema.index(
    {
        userId: 1,
        productId: 1,
    },
    {
        unique: true,
    }
);

reviewSchema.post("save", async function () {
    const result = await this.constructor.aggregate([
        {
            $match: {
                productId: this.productId,
            },
        },
        {
            $group: {
                _id: null,
                avg: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    await Product.findByIdAndUpdate(this.productId, {
        averageRating: result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0,
        numReviews: result.length > 0 ? result[0].count : 0,
    });
});

export const Review = mongoose.model("Review", reviewSchema);