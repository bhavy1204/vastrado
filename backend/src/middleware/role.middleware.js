import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authorize = (...roles) =>
    asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new APIError(401, "Authentication required");
        }

        if (!roles.includes(req.user.role)) {
            throw new APIError(403, "You are not authorized to perform this action");
        }

        next();
    });

