import { body } from "express-validator";
import { handleValidationErrors } from "./commonErrorHandler.validator.js";

export const validateCreateCoupon = [
    body("code")
        .trim()
        .notEmpty().withMessage("Coupon code is required")
        .isLength({ min: 3, max: 30 }).withMessage("Coupon code must be between 3 and 30 characters"),

    body("discountType")
        .notEmpty().withMessage("Discount type is required")
        .isIn(["percentage", "fixed"])
        .withMessage("Discount type must be percentage or fixed"),

    body("discountValue")
        .notEmpty().withMessage("Discount value is required")
        .isFloat({ min: 0 }).withMessage("Discount value must be a non-negative number"),

    body("minimumOrderValue")
        .optional()
        .isFloat({ min: 0 }).withMessage("Minimum order value must be a non-negative number"),

    body("expiresAt")
        .notEmpty().withMessage("Expiry date is required")
        .isISO8601().withMessage("Invalid expiry date"),

    body("scope")
        .notEmpty().withMessage("Coupon scope is required")
        .isIn(["GLOBAL", "CITY"])
        .withMessage("Invalid coupon scope"),

    body("cityId")
        .optional({ nullable: true })
        .isMongoId().withMessage("Invalid City ID"),

    handleValidationErrors,
];
