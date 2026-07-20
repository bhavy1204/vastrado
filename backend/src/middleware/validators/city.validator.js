import { body } from "express-validator";
import { handleValidationErrors } from "./commonErrorHandler.validator.js";

export const validateCreateCity = [
    body("name")
        .trim()
        .notEmpty().withMessage("City name is required")
        .isLength({ min: 2, max: 100 }).withMessage("City name must be between 2 and 100 characters"),

    body("state")
        .trim()
        .notEmpty().withMessage("State is required")
        .isLength({ min: 2, max: 100 }).withMessage("State must be between 2 and 100 characters"),

    body("settings.deliveryCharge")
        .notEmpty().withMessage("Delivery charge is required")
        .isFloat({ min: 0 }).withMessage("Delivery charge must be a non-negative number"),

    body("settings.freeDeliveryAbove")
        .notEmpty().withMessage("Free delivery amount is required")
        .isFloat({ min: 0 }).withMessage("Free delivery amount must be a non-negative number"),

    body("settings.allowedCOD")
        .notEmpty().withMessage("COD availability is required")
        .isBoolean().withMessage("allowedCOD must be true or false"),

    body("settings.supportEmail")
        .trim()
        .notEmpty().withMessage("Support email is required")
        .isEmail().withMessage("Invalid support email"),

    body("settings.supportPhone")
        .trim()
        .notEmpty().withMessage("Support phone is required")
        .matches(/^(?:\+91)?[6-9]\d{9}$/).withMessage("Invalid mobile number"),


    handleValidationErrors,
];

