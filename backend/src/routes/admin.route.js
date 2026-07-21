import { Router } from "express";

import {
    getAllSellers,
    getSellerById,
    approveSeller,
    suspendSeller,
    getAllUsers,
    getUserById,
    getUserByEmail,
    deleteUser,
    getDashboardStats,
} from "../controllers/admin.controller.js";

import {
    createCity,
    getAllCities,
    getAllActiveCities,
    getCityById,
    toggleCityStatus,
    deleteCity,
} from "../controllers/city.controller.js";

import {
    createStaff,
    getAllStaff,
    getStaffByID,
    getCityAdmin,
    activateStaff,
    suspendStaff,
    deleteStaff,
} from "../controllers/staff.controller.js";

import {
    validateObjectId,
    validatePaginationQuery,
} from "../middleware/validators/admin.validator.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

// dashboard

router.get("/dashboard/stats", getDashboardStats);

// sellers

router.get("/sellers", validatePaginationQuery, getAllSellers);
router.get("/sellers/:id", validateObjectId, getSellerById);
router.patch("/sellers/:id/approve", validateObjectId, approveSeller);
router.patch("/sellers/:id/suspend", validateObjectId, suspendSeller);

//users

router.get("/users", getAllUsers);
router.get("/user/search", getUserByEmail);
router.get("/users/:id", validateObjectId, getUserById);
router.delete("/users/:id", validateObjectId, deleteUser);

//cities

router.post("/cities", createCity);
router.get("/cities", getAllCities);
router.get("/cities/active", getAllActiveCities);
router.get("/cities/:cityId", validateObjectId, getCityById);
router.patch("/cities/:cityId/toggle-status", validateObjectId, toggleCityStatus);
router.delete("/cities/:cityId", validateObjectId, deleteCity);

// staff

router.post("/staff", createStaff);
router.get("/staff", getAllStaff);
router.get("/staff/:staffId", validateObjectId, getStaffByID);
router.get("/cities/:cityId/admin", validateObjectId, getCityAdmin);
router.patch("/staff/:staffId/activate", validateObjectId, activateStaff);
router.patch("/staff/:staffId/suspend", validateObjectId, suspendStaff);
router.delete("/staff/:staffId", validateObjectId, deleteStaff);

export default router;
