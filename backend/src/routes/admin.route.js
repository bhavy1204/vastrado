// admin.routes.js
import { Router } from "express"
import {
    getAllSellers,
    getSellerById,
    approveSeller,
    suspendSeller,
    getAllUsers,
    getUserById,
    getUserByEmail,
    deleteUser,
    getDashboardStats
} from "../controllers/admin.controller.js"
import { validateObjectId, validatePaginationQuery } from "../middleware/validators/admin.validator.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { verifyAdmin } from "../middleware/admin.middleware.js"

const router = Router()

router.use(verifyJWT, verifyAdmin)

router.get("/dashboard/stats", getDashboardStats)


router.get("/sellers", validatePaginationQuery, getAllSellers)
router.get("/sellers/:id", validateObjectId, getSellerById)
router.patch("/sellers/:id/approve", approveSeller)
router.patch("/sellers/:id/suspend", suspendSeller)


router.get("/users", getAllUsers)
router.get("/user/search", getUserByEmail)
router.get("/users/:id", validateObjectId, getUserById)
router.delete("/users/:id", validateObjectId, deleteUser)

export default router





