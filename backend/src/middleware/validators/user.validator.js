import { body } from "express-validator"
import { handleValidationErrors } from "./commonErrorHandler.validator.js"

const PHONE_REGEX = /^(?:\+91)?[6-9]\d{9}$/
const POSTAL_REGEX = /^[1-9][0-9]{5}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// register

export const validateUserRegister = [
    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ max: 60 }).withMessage("Full name must be at most 60 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .matches(PASSWORD_REGEX)
        .withMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character"),

    handleValidationErrors
]

// login

export const validateUserLogin = [
    body("identifier")
        .trim()
        .notEmpty().withMessage("Email or username is required"),

    body("password")
        .notEmpty().withMessage("Password is required"),

    handleValidationErrors
]

//  update

export const validateUserUpdateProfile = [
    body("fullName")
        .optional()
        .trim()
        .isLength({ max: 60 }).withMessage("Full name must be at most 60 characters"),

    handleValidationErrors
]

// ─── ADD ADDRESS ──────────────────────────────────────────────────────────────

export const validateUserAddress = [
    body("label")
        .optional()
        .isIn(["home", "office"]).withMessage("Label must be home or office"),

    body("addressLine1")
        .trim()
        .notEmpty().withMessage("Address line 1 is required")
        .isLength({ max: 100 }).withMessage("Address line 1 must be at most 100 characters"),

    body("addressLine2")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Address line 2 must be at most 100 characters"),

    body("landmark")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Landmark must be at most 100 characters"),

    body("city")
        .trim()
        .notEmpty().withMessage("City is required")
        .isLength({ max: 50 }).withMessage("City must be at most 50 characters"),

    body("state")
        .trim()
        .notEmpty().withMessage("State is required")
        .isLength({ max: 50 }).withMessage("State must be at most 50 characters"),

    body("postalCode")
        .trim()
        .notEmpty().withMessage("Postal code is required")
        .matches(POSTAL_REGEX).withMessage("Invalid Indian postal code"),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required for address")
        .matches(PHONE_REGEX).withMessage("Invalid Indian phone number"),

    body("isDefault")
        .optional()
        .isBoolean().withMessage("isDefault must be a boolean"),

    handleValidationErrors
]