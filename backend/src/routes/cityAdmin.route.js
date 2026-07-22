import { Router } from "express";

import {
    approveCitySeller,
    suspendCitySeller,
    getCityStaff,
    getCitySellers,
    getCitySellerByEmail
} from "../controllers/cityAdmin.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyCityAdmin } from "../middleware/cityAdmin.middleware.js";
import {
    validateObjectId,
    validatePaginationQuery,
} from "../middleware/validators/admin.validator.js";
import { verifyStaffJWT } from "../middleware/staff.middleware.js";

const router = Router();

router.use(verifyStaffJWT, verifyCityAdmin);

//sellers

router.get("/sellers", validatePaginationQuery, getCitySellers);
router.get("/seller/search", getCitySellerByEmail);
router.patch("/sellers/:sellerId/approve", validateObjectId, approveCitySeller);
router.patch("/sellers/:sellerId/suspend", validateObjectId, suspendCitySeller);

//staff

router.get("/staff", getCityStaff);

export default router;
