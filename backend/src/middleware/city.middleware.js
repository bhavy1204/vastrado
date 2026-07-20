import { City } from "../models/city.model.js";
import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const resolveCity = asyncHandler(async (req, res, next) => {
    const { citySlug } = req.params;

    if (!citySlug) {
        throw new APIError(400, "City slug is required");
    }

    const city = await City.findOne({
        slug: citySlug,
        isActive: true,
    });

    if (!city) {
        throw new APIError(404, "City not found");
    }

    req.city = city;

    next();
});

