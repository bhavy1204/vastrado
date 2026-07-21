import { body } from "express-validator"
import { handleValidationErrors } from "./commonErrorHandler.validator.js"

const PHONE_REGEX = /^(?:\+91)?[6-9]\d{9}$/
const POSTAL_REGEX = /^[1-9][0-9]{5}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// register

export const validateSellerRegister = [
    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ max: 80 }).withMessage("Full name must be at most 60 characters"),

    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 30 }).withMessage("Username must be between 3 and 30 characters")
        .matches(/^[a-z0-9_]+$/).withMessage("Username can only contain lowercase letters, numbers, and underscores"),

    body("shopName")
        .trim()
        .notEmpty().withMessage("Shop name is required")
        .isLength({ max: 80 }).withMessage("Shop name must be at most 80 characters"),

    body("shopDescription")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Shop description must be at most 500 characters"),

    body("shopCategory")
        .optional()
        .isIn(["electronics", "clothing", "furniture", "general"])
        .withMessage("Invalid shop category"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .matches(PASSWORD_REGEX)
        .withMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character"),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .matches(PHONE_REGEX).withMessage("Invalid Indian phone number"),

    body("whatsappNumber")
        .trim()
        .notEmpty().withMessage("WhatsApp number is required")
        .matches(PHONE_REGEX).withMessage("Invalid Indian WhatsApp number"),

    body("altPhone")
        .optional()
        .trim()
        .matches(PHONE_REGEX).withMessage("Invalid Indian alternate phone number"),

    body("addressLine1")
        .trim()
        .notEmpty().withMessage("Address line 1 is required")
        .isLength({ max: 100 }).withMessage("Address line 1 must be at most 100 characters"),

    body("addressLine2")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Address line 2 must be at most 100 characters"),

    body("cityId")
        .isMongoId()
        .notEmpty().withMessage("City ID is required"),

    body("postalCode")
        .trim()
        .notEmpty().withMessage("Postal code is required")
        .matches(POSTAL_REGEX).withMessage("Invalid Indian postal code"),

    body("location.coordinates")
        .isArray({ min: 2, max: 2 }).withMessage("Coordinates must be an array of [longitude, latitude]")
        .custom(([lng, lat]) => {
            if (typeof lng !== "number" || typeof lat !== "number") {
                throw new Error("Coordinates must be numbers")
            }
            if (lng < -180 || lng > 180) throw new Error("Longitude must be between -180 and 180")
            if (lat < -90 || lat > 90) throw new Error("Latitude must be between -90 and 90")
            return true
        }),
    
    body("googleMapLink")
        .optional()
        .trim(),
    handleValidationErrors
]

// login

export const validateSellerLogin = [
    // for identifying wether login with email or username. 
    body("identifier")
        .trim()
        .notEmpty().withMessage("Email or username is required"),

    body("password")
        .notEmpty().withMessage("Password is required"),

    handleValidationErrors
]

// update profile

export const validateSellerUpdateProfile = [
    body("fullName")
        .optional()
        .trim()
        .isLength({ max: 60 }).withMessage("Full name must be at most 60 characters"),

    body("shopName")
        .optional()
        .trim()
        .isLength({ max: 80 }).withMessage("Shop name must be at most 80 characters"),

    body("shopDescription")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Shop description must be at most 500 characters"),

    body("shopCategory")
        .optional()
        .isIn(["electronics", "clothing", "furniture", "general"])
        .withMessage("Invalid shop category"),

    body("phone")
        .optional()
        .trim()
        .matches(PHONE_REGEX).withMessage("Invalid Indian phone number"),

    body("whatsappNumber")
        .optional()
        .trim()
        .matches(PHONE_REGEX).withMessage("Invalid Indian WhatsApp number"),

    body("altPhone")
        .optional()
        .trim()
        .matches(PHONE_REGEX).withMessage("Invalid Indian alternate phone number"),

    body("addressLine1")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Address line 1 must be at most 100 characters"),

    body("addressLine2")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Address line 2 must be at most 100 characters"),

    body("cityId")
        .optional()
        .trim()
        .isMongoId()
        .isLength({ max: 50 }).withMessage("City must be at most 50 characters"),

    body("postalCode")
        .optional()
        .trim()
        .matches(POSTAL_REGEX).withMessage("Invalid Indian postal code"),

    body("location.coordinates")
        .optional()
        .isArray({ min: 2, max: 2 }).withMessage("Coordinates must be an array of [longitude, latitude]")
        .custom(([lng, lat]) => {
            if (typeof lng !== "number" || typeof lat !== "number") {
                throw new Error("Coordinates must be numbers")
            }
            if (lng < -180 || lng > 180) throw new Error("Longitude must be between -180 and 180")
            if (lat < -90 || lat > 90) throw new Error("Latitude must be between -90 and 90")
            return true
        }),

    handleValidationErrors
]