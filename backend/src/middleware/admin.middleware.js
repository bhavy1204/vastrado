import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/apiError.js"

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    const id = req.user?._id;

    const user = await User.findById(id).select("role");

    if (!user) {
        throw new APIError(404, "No such user exists")
    }
    if (user.role !== "admin") {
        throw new APIError(403, "Admin access only")
    }

    next;
});