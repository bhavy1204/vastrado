import { body } from "express-validator";
import { handleValidationErrors } from "./commonErrorHandler.validator.js";

export const validateCreateStaff = [
    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 3, max: 100 }).withMessage("Full name must be between 3 and 100 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

    body("role")
        .notEmpty().withMessage("Role is required")
        .isIn(["city-admin", "delivery-agent", "support-team"])
        .withMessage("Invalid staff role"),

    // will come from a drop down list from frontend.
    body("cityId")
        .notEmpty().withMessage("City ID is required")
        .isMongoId().withMessage("Invalid City ID"),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .matches(/^(?:\+91)?[6-9]\d{9}$/).withMessage("Invalid mobile number"),

    body("altPhone")
        .optional()
        .trim()
        .matches(/^(?:\+91)?[6-9]\d{9}$/).withMessage("Invalid alternate mobile number"),

    handleValidationErrors,
];

