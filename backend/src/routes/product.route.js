import express from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductById,
    getProductBySlug,
    getSellerProducts,
    getMyProducts,
    getAllProducts,
    getProductsByCategory,
    getProductsByGender,
    searchProducts,
} from "../controllers/product.controller.js";
import { verifyJWT, verifySellerOnly } from "../middleware/auth.middleware.js";
import {
    validateCreateProduct,
    validateUpdateProduct,
} from "../middleware/validators/product.validator.js";
import { validateObjectId, validatePaginationQuery } from "../middleware/validators/common.validator.js";
import { uploadProductImages } from "../middleware/upload.middleware.js";

const router = express.Router();

// public

router.get("/", validatePaginationQuery, getAllProducts);
router.get("/search", validatePaginationQuery, searchProducts);
router.get("/category/:productType", validatePaginationQuery, getProductsByCategory);
router.get("/gender/:gender", validatePaginationQuery, getProductsByGender);
router.get("/seller/:sellerId", validateObjectId("sellerId"), validatePaginationQuery, getSellerProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:productId", validateObjectId("productId"), getProductById);

// protected, for seller only

router.use(verifyJWT, verifySellerOnly);

router.get("/my/products", validatePaginationQuery, getMyProducts);
router.post("/", uploadProductImages, validateCreateProduct, createProduct);
router.patch("/:productId", validateObjectId("productId"), validateUpdateProduct, updateProduct);
router.patch("/:productId/toggle", validateObjectId("productId"), toggleProductStatus);
router.delete("/:productId", validateObjectId("productId"), deleteProduct);

export default router;