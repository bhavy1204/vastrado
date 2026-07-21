import slugify from "slugify";
import sharp from "sharp";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Product } from "../models/product.model.js";
import { Seller } from "../models/seller.model.js";
import { uploadToB2 } from "../utils/B2.js";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const processAndUploadProductImage = async (buffer, sellerId, index) => {
    const webpBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

    const key = `products/${sellerId}/${Date.now()}-${index}.webp`;
    const url = await uploadToB2(webpBuffer, key, "image/webp");
    return url;
};

const buildProductFilters = (query) => {
    const filters = { isActive: true };

    if (query.productType) filters.productType = query.productType;
    if (query.gender) filters.gender = query.gender;
    if (query.color) filters.color = query.color.toLowerCase();
    if (query.brand) filters.brand = { $regex: query.brand, $options: "i" };

    if (query.minPrice || query.maxPrice) {
        filters.price = {};
        if (query.minPrice) filters.price.$gte = parseFloat(query.minPrice);
        if (query.maxPrice) filters.price.$lte = parseFloat(query.maxPrice);
    }

    return filters;
};

const buildSortOption = (sort) => {
    switch (sort) {
        case "price-asc": return { price: 1 };
        case "price-desc": return { price: -1 };
        case "top-rated": return { averageRating: -1, numReviews: -1 };
        case "oldest": return { createdAt: 1 };
        default: return { createdAt: -1 }; // newest first
    }
};

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────

const createProduct = asyncHandler(async (req, res) => {
    console.log("SELLER EACHED HERE");
    const seller = await Seller.findById(req.user._id).select("subscription status");

    if (seller.status === "suspended" || seller.status === "pending") {
        throw new APIError(403, "Your account is pending admin approval");
    }

    if (seller.subscription.status !== "active") {
        throw new APIError(403, "An active subscription is required to list products");
    }

    const files = req.files?.images;
    if (!files || files.length === 0) {
        throw new APIError(400, "At least one product image is required");
    }

    if (files.length > 4) {
        throw new APIError(400, "Maximum 4 images allowed per product");
    }

    // upload all images in parallel
    const imageUrls = await Promise.all(
        files.map((file, index) =>
            processAndUploadProductImage(file.buffer, req.user._id.toString(), index)
        )
    );

    const {
        productName, productDescription, price, discountedPrice,
        gender, productType, color, brand, variants
    } = req.body;

    // create with placeholder slug first to get _id
    const product = await Product.create({
        sellerId: req.user._id,
        productName,
        productDescription,
        price,
        discountedPrice: discountedPrice || 0,
        images: imageUrls,
        gender,
        productType,
        color,
        brand,
        variants: typeof variants === "string" ? JSON.parse(variants) : variants,
        slug: `${slugify(productName, { lower: true, strict: true })}-placeholder-${Date.now()}`,
    });

    // update slug with _id suffix for guaranteed uniqueness
    product.slug = `${slugify(productName, { lower: true, strict: true })}-${product._id}`;
    await product.save({ validateBeforeSave: false });

    return res.status(201).json(
        new APIResponse(201, product, "Product created successfully")
    );
});

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────

const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw new APIError(404, "Product not found");

    if (product.sellerId.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You can only update your own products");
    }

    const allowedFields = [
        "productName", "productDescription",
        "price", "discountedPrice", "variants"
    ];

    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // if productName changes, regenerate slug
    if (updates.productName) {
        updates.slug = `${slugify(updates.productName, { lower: true, strict: true })}-${product._id}`;
    }

    if (updates.variants && typeof updates.variants === "string") {
        updates.variants = JSON.parse(updates.variants);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new APIResponse(200, updatedProduct, "Product updated successfully")
    );
});

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw new APIError(404, "Product not found");

    if (product.sellerId.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You can only delete your own products");
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json(
        new APIResponse(200, { deletedProductId: productId }, "Product deleted successfully")
    );
});

// ─── TOGGLE PRODUCT STATUS ────────────────────────────────────────────────────

const toggleProductStatus = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId).select("sellerId isActive");
    if (!product) throw new APIError(404, "Product not found");

    if (product.sellerId.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You can only update your own products");
    }

    product.isActive = !product.isActive;
    await product.save({ validateBeforeSave: false });

    return res.status(200).json(
        new APIResponse(200,
            { isActive: product.isActive },
            `Product ${product.isActive ? "activated" : "deactivated"} successfully`
        )
    );
});

// ─── GET PRODUCT BY ID (public) ───────────────────────────────────────────────

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, isActive: true })
        .populate("sellerId", "shopName slug cityId whatsappNumber avatar")
        .lean();

    if (!product) throw new APIError(404, "Product not found");

    return res.status(200).json(
        new APIResponse(200, product, "Product fetched successfully")
    );
});

// ─── GET PRODUCT BY SLUG (public, SEO) ───────────────────────────────────────

const getProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true })
        .populate("sellerId", "shopName slug city whatsappNumber avatar")
        .lean();

    if (!product) throw new APIError(404, "Product not found");

    return res.status(200).json(
        new APIResponse(200, product, "Product fetched successfully")
    );
});

// ─── GET SELLER PRODUCTS (public shop page) ───────────────────────────────────

const getSellerProducts = asyncHandler(async (req, res) => {
    const { sellerId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const seller = await Seller.findOne({ _id: sellerId, status: "approved" }).select("_id");
    if (!seller) throw new APIError(404, "Shop not found");

    const [products, total] = await Promise.all([
        Product.find({ sellerId, isActive: true })
            .select("productName slug price discountedPrice images averageRating numReviews productType gender")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({ sellerId, isActive: true }),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }, "Seller products fetched successfully")
    );
});

// ─── GET MY PRODUCTS (seller dashboard) ──────────────────────────────────────

const getMyProducts = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // seller sees all products including inactive
    const [products, total] = await Promise.all([
        Product.find({ sellerId: req.user._id })
            .select("productName productDescription slug price discountedPrice images isActive averageRating numReviews productType gender color brand variants createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({ sellerId: req.user._id }),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }, "Your products fetched successfully")
    );
});

// ─── GET ALL PRODUCTS (public listing with filters) ───────────────────────────

const getAllProducts = asyncHandler(async (req, res) => {
    const { cityId } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filters = buildProductFilters(req.query);
    const sort = buildSortOption(req.query.sort);

    const [products, total] = await Promise.all([
        Product.find(filters)
            .select("productName slug price discountedPrice images averageRating numReviews productType gender color brand sellerId")
            .populate("sellerId", "shopName city")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filters),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }, "Products fetched successfully")
    );
});

// ─── GET PRODUCTS BY CATEGORY ─────────────────────────────────────────────────

const getProductsByCategory = asyncHandler(async (req, res) => {
    const { productType } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const validTypes = [
        "tshirt", "shirt", "hoodie", "jacket", "jeans",
        "trouser", "shorts", "dress", "kurti", "salwar", "saree", "kurta"
    ];

    if (!validTypes.includes(productType)) {
        throw new APIError(400, "Invalid product category");
    }

    const filters = { isActive: true, productType };
    const sort = buildSortOption(req.query.sort);

    const [products, total] = await Promise.all([
        Product.find(filters)
            .select("productName slug price discountedPrice images averageRating numReviews gender color brand")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filters),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }, `${productType} products fetched successfully`)
    );
});

// ─── GET PRODUCTS BY GENDER ───────────────────────────────────────────────────

const getProductsByGender = asyncHandler(async (req, res) => {
    const { gender } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const validGenders = ["men", "women", "kids", "unisex"];
    if (!validGenders.includes(gender)) {
        throw new APIError(400, "Invalid gender filter");
    }

    const sort = buildSortOption(req.query.sort);

    const [products, total] = await Promise.all([
        Product.find({ isActive: true, gender })
            .select("productName slug price discountedPrice images averageRating numReviews productType color brand")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({ isActive: true, gender }),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }, `${gender} products fetched successfully`)
    );
});

// ─── SEARCH PRODUCTS ──────────────────────────────────────────────────────────

const searchProducts = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
        throw new APIError(400, "Search query must be at least 2 characters");
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(q.trim(), "i");

    // find sellers whose shopName matches — for "xyz store black tshirt" type queries
    const matchingSellers = await Seller.find({
        shopName: searchRegex,
        status: "approved"
    }).select("_id").lean();

    const sellerIds = matchingSellers.map((s) => s._id);

    const searchFilter = {
        isActive: true,
        $or: [
            { productName: searchRegex },
            { brand: searchRegex },
            ...(sellerIds.length > 0 ? [{ sellerId: { $in: sellerIds } }] : []),
        ],
    };

    const [products, total] = await Promise.all([
        Product.find(searchFilter)
            .select("productName slug price discountedPrice images averageRating numReviews productType gender brand sellerId")
            .populate("sellerId", "shopName city")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(searchFilter),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            query: q,
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }, "Search results fetched successfully")
    );
});

export {
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductById,
    getProductBySlug,
    getSellerProducts,
    getMyProducts,
    getAllProducts,
    getProductsByCategory,
    getProductsByGender,
    searchProducts,
};

