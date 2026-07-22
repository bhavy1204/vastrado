import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Staff } from "../models/staff.model.js";
import { Seller } from "../models/seller.model.js";

const approveCitySeller = asyncHandler(async (req, res) => {
    console.log("city admin reached herer");
    const { sellerId } = req.params;

    const staff = req.staff;

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    if (staff.role !== "city-admin") {
        throw new APIError(403, "Only city admin can perform this action");
    }

    console.log("city admin reached herer 2");

    const seller = await Seller.findById(sellerId);

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    if (seller.cityId.toString() !== staff.cityId.toString()) {
        throw new APIError(403, "You can only manage sellers of your city");
    }

    console.log("city admin reached herer 3 ");

    seller.status = "approved";
    await seller.save();

    console.log("city admin reached herer 4 ");
    
    return res.status(200).json(
        new APIResponse(200, seller, "Seller approved successfully")
    );
});

const suspendCitySeller = asyncHandler(async (req, res) => {
    const { sellerId } = req.params;

    const staff = req.staff;

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    if (staff.role !== "city-admin") {
        throw new APIError(403, "Only city admin can perform this action");
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    if (seller.cityId.toString() !== staff.cityId.toString()) {
        throw new APIError(403, "You can only manage sellers of your city");
    }

    seller.status = "suspended";
    await seller.save();

    return res.status(200).json(
        new APIResponse(200, seller, "Seller suspended successfully")
    );
});

const getCityStaff = asyncHandler(async (req, res) => {
    const staff = req.staff;

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    if (staff.role !== "city-admin") {
        throw new APIError(403, "Only city admin can access this resource");
    }

    const cityStaff = await Staff.find({
        cityId: staff.cityId,
    })
        .select("-password -refreshToken")
        .sort({ role: 1, createdAt: -1 })
        .lean();

    return res.status(200).json(
        new APIResponse(200, cityStaff, "City staff fetched successfully")
    );
});

const getCitySellers = asyncHandler(async (req, res) => {
    const staff = req.staff;

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    if (staff.role !== "city-admin") {
        throw new APIError(403, "Only city admin can access this resource");
    }

    const sellers = await Seller.find({
        cityId: staff.cityId,
    })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new APIResponse(200, sellers, "City sellers fetched successfully")
    );
});

const getCitySellerByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;

    const staff = req.staff;

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    if (staff.role !== "city-admin") {
        throw new APIError(403, "Only city admin can access this resource");
    }

    const seller = await Seller.findOne({
        email: email.toLowerCase(),
        cityId: staff.cityId,
    }).select("-password -refreshToken");

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    return res.status(200).json(
        new APIResponse(200, seller, "Seller fetched successfully")
    );
});

export {
    approveCitySeller,
    suspendCitySeller,
    getCityStaff,
    getCitySellers,
    getCitySellerByEmail,
};