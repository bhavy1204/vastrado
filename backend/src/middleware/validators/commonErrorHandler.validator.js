import { validationResult } from "express-validator"
import { APIError } from "../../utils/apiError.js"

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new APIError(400, "Validation failed", errors.array()))
    }

    console.log("AT end of validation")
    next()
}