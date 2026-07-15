import { body } from "express-validator"
import { handleValidationErrors } from "./commonErrorHandler.validator.js"

const VALID_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
const VALID_GENDERS = ["men", "women", "kids", "unisex"]
const VALID_PRODUCT_TYPES = [
    "tshirt", "shirt", "hoodie", "jacket", "jeans", "trouser", "shorts", "dress", "kurti", "salwar", "saree", "kurta"
]

// create

export const validateCreateProduct = [
    body("productName")
        .trim()
        .notEmpty().withMessage("Product name is required")
        .isLength({ min: 3, max: 150 }).withMessage("Product name must be between 3 and 150 characters"),

    body("productDescription")
        .trim()
        .notEmpty().withMessage("Product description is required")
        .isLength({ max: 2000 }).withMessage("Product description must be at most 2000 characters"),

    body("price")
        .notEmpty().withMessage("Price is required")
        .isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),

    body("discountedPrice")
        .optional()
        .isFloat({ min: 0 }).withMessage("Discounted price must be a non-negative number")
        .custom((val, { req }) => {
            if (val !== undefined && val !== 0 && parseFloat(val) >= parseFloat(req.body.price)) {
                throw new Error("Discounted price must be less than the original price")
            }
            return true
        }),

    body("gender")
        .notEmpty().withMessage("Gender is required")
        .isIn(VALID_GENDERS).withMessage(`Gender must be one of: ${VALID_GENDERS.join(", ")}`),

    body("productType")
        .notEmpty().withMessage("Product type is required")
        .isIn(VALID_PRODUCT_TYPES).withMessage(`Product type must be one of: ${VALID_PRODUCT_TYPES.join(", ")}`),

    body("color")
        .optional()
        .trim()
        .isLength({ max: 30 }).withMessage("Color must be at most 30 characters"),

    body("brand")
        .optional()
        .trim()
        .isLength({ max: 60 }).withMessage("Brand must be at most 60 characters"),

    // variants array
    body("variants")
        .isArray({ min: 1 }).withMessage("At least one size variant is required"),

    body("variants.*.size")
        .notEmpty().withMessage("Each variant must have a size")
        .isIn(VALID_SIZES).withMessage(`Size must be one of: ${VALID_SIZES.join(", ")}`),

    body("variants.*.quantity")
        .notEmpty().withMessage("Each variant must have a quantity")
        .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),

    handleValidationErrors
]

// update
// Only these fields are updatable in V1:
// productName, productDescription, price, discountedPrice, variants (quantity only)

export const validateUpdateProduct = [
    body("productName")
        .optional()
        .trim()
        .isLength({ min: 3, max: 150 }).withMessage("Product name must be between 3 and 150 characters"),

    body("productDescription")
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage("Product description must be at most 2000 characters"),

    body("price")
        .optional()
        .isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),

    body("discountedPrice")
        .optional()
        .isFloat({ min: 0 }).withMessage("Discounted price must be a non-negative number")
        .custom((val, { req }) => {
            console.log({
                bodyPrice: req.body.price,
                productPrice: req.product?.price,
                discount: val,
            });
            const price = req.body.price ?? req.product?.price  // req.product set by controller if needed
            if (val !== undefined && val !== 0 && price && parseFloat(val) >= parseFloat(price)) {
                throw new Error("Discounted price must be less than the original price")
            }
            return true
        }),

    // variants — only quantity is updatable, size enum stays fixed
    body("variants")
        .optional()
        .isArray({ min: 1 }).withMessage("At least one size variant is required"),

    body("variants.*.size")
        .optional()
        .isIn(VALID_SIZES).withMessage(`Size must be one of: ${VALID_SIZES.join(", ")}`),

    body("variants.*.quantity")
        .optional()
        .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),

    handleValidationErrors
]