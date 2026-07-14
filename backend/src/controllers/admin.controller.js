import {asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import { APIError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Seller } from "../models/seller.model.js";
import {Product} from "../models/product.model.js"

const getAllSellers = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [sellers, total] = await Promise.all([
        Seller.find()
            .select("-password -refreshToken -authId")
            .skip(skip)
            .limit(limit)
            .lean(),
        Seller.countDocuments()
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            sellers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, "Sellers fetched successfully")
    );

})

const getSellerById = asyncHandler(async (req, res) => {

    const seller = await Seller.findById(req.params.id)
        .select("-password -refreshToken -authId")
        .lean();

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    return res.status(200).json(
        new APIResponse(200, seller, "Seller fetched successfully")
    );
});

const approveSeller = asyncHandler(async (req, res) => {

    const seller = await Seller.findById(req.params.id).select("-password -refreshToken -authId");

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    if (seller.isApproved) {
        throw new APIError(400, "Seller is already approved");
    }

    seller.isApproved = true;

    await seller.save();

    return res.status(200).json(
        new APIResponse(200, { isApproved: seller.isApproved }, "Seller approved successfully")
    );
})

const suspendSeller = asyncHandler(async (req, res) => {
    console.log("SUSPEND REQ");
    const seller = await Seller.findById(req.params.id).select("-password -refreshToken -authId");

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    if (!seller.isApproved) {
        throw new APIError(400, "Seller is already suspended or not yet approved");
    }

    seller.isApproved = false;
    await seller.save();

    return res.status(200).json(
        new APIResponse(200, { isApproved: seller.isApproved }, "Seller suspended successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    console.log("USER REACHED HERE")
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .select("-password -refreshToken -authId")
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments()
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, "Users fetched successfully")
    );
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select("-password -refreshToken")
        .lean();

    if (!user) {
        throw new APIError(404, "User not found");
    }

    return res.status(200).json(
        new APIResponse(200, user, "User fetched successfully")
    );
});

const getUserByEmail = asyncHandler(async (req, res) => {
    const { email } = req.query

    if (!email) {
        throw new APIError(400, "Email required")
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("-password -refreshToken -authProvider -providerId");

    if (!user) {
        throw new APIError(404, "No such user exists")
    }

    return res.status(200).json(
        new APIResponse(200, user, "user fetched Successfully")
    )
});

const deleteUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new APIError(404, "User not found");
    }

    if (user.role === "admin") {
        throw new APIError(403, "Admin accounts cannot be deleted via this route");
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json(
        new APIResponse(200, { deletedUserId: req.params.id }, "User deleted successfully")
    );
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalSellers,
        pendingApprovals,
        pendingSubscriptions,
        totalProducts
    ] = await Promise.all([
        User.countDocuments(),
        Seller.countDocuments(),
        Seller.countDocuments({ isApproved: false }),
        Seller.countDocuments({ "subscription.status": "pending" }),
        Product.countDocuments()
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            totalUsers,
            totalSellers,
            pendingApprovals,
            pendingSubscriptions,
            totalProducts
        }, "Dashboard stats fetched successfully")
    );
});

export {
    getAllSellers,
    getSellerById,
    approveSeller,
    suspendSeller,
    getAllUsers,
    getUserById,
    getUserByEmail,
    deleteUser,
    getDashboardStats
}



