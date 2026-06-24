import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { Seller } from "../models/seller.model.js"
import { APIError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// JWT verifier and user attacher

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.headers?.authorization?.replace("Bearer ", "")

    if (!token) {
        throw new APIError(401, "Access token is required")
    }

    let decoded

    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    } catch (err) {

        if (err.name === "TokenExpiredError") {
            throw new APIError(401, "Access token has expired");
        }

        throw new APIError(401, "Invalid access token");
    }

    const { _id, type } = decoded;

    if (type === "user") {
        const user = await User.findById(_id).select("-password -refreshToken -isOAuth -authProvider -providerId ")

        if (!user) {
            throw new APIError(401, "User not found or token is invalid")
        }

        req.user = user
        req.userType = "user"

        return next()
    }

    if (type === "seller") {
        const seller = await Seller.findById(_id).select("-password -refreshToken -providerId -isOAuth -authProvider ")

        if (!seller) {
            throw new APIError(401, "Seller not found or token is invalid");
        }

        req.user = seller
        req.userType = "seller"

        return next()
    }

    throw new APIError(401, "Invalid token type")
})

// type checkers

export const verifySellerOnly = asyncHandler(async (req, res, next) => {

    if (req.userType !== "seller") {
        throw new APIError(403, "Seller access only")
    }
    
    next()
})

export const verifyUserOnly = asyncHandler(async (req, res, next) => {

    if (req.userType !== "user") {
        throw new APIError(403, "User access only")
    }

    next()
})