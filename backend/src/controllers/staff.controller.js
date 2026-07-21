import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Staff } from "../models/staff.model.js";
import { City } from "../models/city.model.js";

const createStaff = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        password,
        role,
        cityId,
        phone,
        altPhone,
    } = req.body;

    if (
        !fullName ||
        !email ||
        !password ||
        !role ||
        !cityId ||
        !phone
    ) {
        throw new APIError(400, "All required fields are mandatory");
    }

    const city = await City.findById(cityId);

    if (!city) {
        throw new APIError(404, "City not found");
    }

    const existingEmail = await Staff.findOne({ email });

    if (existingEmail) {
        throw new APIError(409, "Email already exists");
    }

    const existingPhone = await Staff.findOne({ phone });

    if (existingPhone) {
        throw new APIError(409, "Phone number already exists");
    }

    if (role === "city-admin") {
        const existingAdmin = await Staff.findOne({
            cityId,
            role: "city-admin",
        });

        if (existingAdmin) {
            throw new APIError(409, "City already has an admin");
        }
    }

    const staff = await Staff.create({
        fullName,
        email,
        password,
        role,
        cityId,
        phone,
        altPhone,
        status: "approved",
    });

    if (role === "city-admin") {
        city.admin = staff._id;
        await city.save();
    }

    const createdStaff = await Staff.findById(staff._id)
        .select("-password -refreshToken")
        .populate("cityId", "name state");

    return res.status(201).json(
        new APIResponse(201, createdStaff, "Staff created successfully")
    );
});

const getAllStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.find()
        .select("-password -refreshToken")
        .populate("cityId", "name state")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new APIResponse(200, staff, "Staff fetched successfully")
    );
});

const getStaffByID = asyncHandler(async (req, res) => {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId)
        .select("-password -refreshToken")
        .populate("cityId", "name state");

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    return res.status(200).json(
        new APIResponse(200, staff, "Staff fetched successfully")
    );
});

const getCityAdmin = asyncHandler(async (req, res) => {
    const { cityId } = req.params;

    const admin = await Staff.findOne({
        cityId,
        role: "city-admin",
    })
        .select("-password -refreshToken")
        .populate("cityId", "name state");

    if (!admin) {
        throw new APIError(404, "City admin not found");
    }

    return res.status(200).json(
        new APIResponse(200, admin, "City admin fetched successfully")
    );
});

const suspendStaff = asyncHandler(async (req, res) => {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    staff.status = "suspended";
    await staff.save();

    return res.status(200).json(
        new APIResponse(200, null, "Staff suspended successfully")
    );
});

const activateStaff = asyncHandler(async (req, res) => {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    staff.status = "approved";
    await staff.save();

    return res.status(200).json(
        new APIResponse(200, null, "Staff activated successfully")
    );
});

const deleteStaff = asyncHandler(async (req, res) => {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);

    if (!staff) {
        throw new APIError(404, "Staff not found");
    }

    if (staff.role === "city-admin") {
        await City.findByIdAndUpdate(staff.cityId, {
            $unset: { admin: 1 },
        });
    }

    await staff.deleteOne();

    return res.status(200).json(
        new APIResponse(200, null, "Staff deleted successfully")
    );
});

export {
    createStaff,
    getAllStaff,
    getStaffByID,
    getCityAdmin,
    suspendStaff,
    activateStaff,
    deleteStaff,
};

