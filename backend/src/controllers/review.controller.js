import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

// helper functions
const recalculateProductRating = async (productId) => {
    const result = await Review.aggregate([
        { $match: { productId } },
        {
            $group: {
                _id: null,
                avg: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    await Product.findByIdAndUpdate(productId, {
        averageRating: result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0,
        numReviews: result.length > 0 ? result[0].count : 0,
    });
};


const addReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw new APIError(404, "Product not found");
    }


    const existingReview = await Review.findOne({
        userId: req.user._id,
        productId,
    });

    if (existingReview) {
        throw new APIError(409, "You have already reviewed this product");
    }


    const review = await Review.create({
        userId: req.user._id,
        productId,
        rating,
        comment: comment || "",
    });

    return res.status(201).json(
        new APIResponse(201, review, "Review added successfully")
    );
});


const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new APIError(404, "Review not found");
    }

    if (review.userId.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You can only edit your own reviews");
    }

    if (rating !== undefined) {
        review.rating = rating;
    }

    if (comment !== undefined) {
        review.comment = comment;
    }

    await review.save(); 

    return res.status(200).json(
        new APIResponse(200, review, "Review updated successfully")
    );
});



const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new APIError(404, "Review not found");
    }

    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new APIError(403, "You are not authorized to delete this review");
    }

    const productId = review.productId;

    await review.deleteOne();
    await recalculateProductRating(productId);

    return res.status(200).json(
        new APIResponse(200, null, "Review deleted successfully")
    );
});



const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const product = await Product.findById(productId).select("_id isActive");
    if (!product || !product.isActive) {
        throw new APIError(404, "Product not found");
    }

    const [reviews, total] = await Promise.all([
        Review.find({ productId })
            .populate("userId", "fullName")
            .select("rating comment createdAt userId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Review.countDocuments({ productId }),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, "Reviews fetched successfully")
    );
});


const getUserReviews = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        Review.find({ userId: req.user._id })
            .populate("productId", "productName slug images")
            .select("rating comment createdAt productId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Review.countDocuments({ userId: req.user._id }),
    ]);

    // only return first image for product card
    const formatted = reviews.map((r) => ({
        ...r,
        productId: r.productId
            ? {
                ...r.productId,
                image: r.productId.images?.[0] ?? null,
                images: undefined,
            }
            : null,
    }));

    return res.status(200).json(
        new APIResponse(200, {
            reviews: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, "Your reviews fetched successfully")
    );
});

export {
    addReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getUserReviews,
};



