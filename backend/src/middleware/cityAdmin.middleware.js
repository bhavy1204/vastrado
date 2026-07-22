import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { Staff } from "../models/staff.model.js";

export const verifyCityAdmin = asyncHandler(async (req, res, next) => {
    console.log("VErifying from city admin >> ", req.staff)
    const id = req.staff?._id;

    const staff = await Staff.findById(id).select("role status cityId");

    if (!staff) {
        throw new APIError(404, "Staff account not found");
    }

    if (staff.role !== "city-admin") {
        throw new APIError(403, "City Admin access only");
    }

    if (staff.status !== "approved") {
        throw new APIError(403, "Your account is not active");
    }

    req.staff = staff;

    console.log("Reacehed at end of cityAdmin middleware")

    next();
});

