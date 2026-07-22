import jwt from "jsonwebtoken";
import {Staff} from "../models/staff.model.js"
import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyStaffJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
        throw new APIError(401, "Access token is required");
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new APIError(401, "Access token has expired");
        }

        throw new APIError(401, "Invalid access token");
    }

    if (decoded.type !== "staff") {
        throw new APIError(401, "Invalid token type");
    }

    const staff = await Staff.findById(decoded._id)
        .select("-password -refreshToken");

    if (!staff) {
        throw new APIError(401, "Staff not found or token is invalid");
    }

    req.staff = staff;
    req.userType = "staff";

    next();
});

