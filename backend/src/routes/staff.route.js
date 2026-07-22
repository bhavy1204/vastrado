import { Router } from "express";
import {
    loginStaff,
    logoutStaff,
    refreshStaffAccessToken,
    getStaffProfile,
} from "../controllers/staff.controller.js";

import { verifyStaffJWT } from "../middleware/staff.middleware.js";

const router = Router();

router.post("/login", loginStaff);
router.post("/refresh-token", refreshStaffAccessToken);

router.use(verifyStaffJWT);

router.post("/logout", logoutStaff);
router.get("/profile", getStaffProfile);

export default router;
