import { param, query } from "express-validator"
import { handleValidationErrors } from "./commonErrorHandler.validator.js"

export const validateObjectId = (paramName = "id") => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`),
    handleValidationErrors
];

export const validatePaginationQuery = [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    handleValidationErrors
]