import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const validateBannerScope = asyncHandler(async (req, res, next) => {
    const { scope, cityId, sellerId } = req.body;

    if (scope === "GLOBAL") {
        req.body.cityId = null;
        req.body.sellerId = null;
    }

    if (scope === "CITY" && !cityId) {
        throw new APIError(400, "City banner requires cityId");
    }

    if (scope === "SELLER" && !sellerId) {
        throw new APIError(400, "Seller banner requires sellerId");
    }

    next();
});
