import { body } from "express-validator";
import { handleValidationErrors } from "./commonErrorHandler.validator.js";

export const validateCreateBanner = [

    body("title")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Title must be at most 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage("Description must be at most 300 characters"),

    body("redirectUrl")
        .optional({ checkFalsy: true })
        .trim()
        .isURL().withMessage("Invalid redirect URL"),

    body("scope")
        .notEmpty().withMessage("Banner scope is required")
        .isIn(["GLOBAL", "CITY", "SELLER"])
        .withMessage("Invalid banner scope"),

    body("cityId")
        .optional({ nullable: true })
        .isMongoId().withMessage("Invalid City ID"),

    body("sellerId")
        .optional({ nullable: true })
        .isMongoId().withMessage("Invalid Seller ID"),

    body("isSponsored")
        .optional()
        .isBoolean().withMessage("isSponsored must be true or false"),

    body("order")
        .optional()
        .isInt({ min: 0 }).withMessage("Order must be a non-negative integer"),

    handleValidationErrors,
];

