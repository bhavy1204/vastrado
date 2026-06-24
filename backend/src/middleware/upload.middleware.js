import multer from "multer"
import { APIError } from "../utils/apiError.js"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 //5mb

// memoryStorage keeps file in buffer — Sharp processes it in the controller, before uploading to Backblaze B2

const storage = multer.memoryStorage()

// file filters

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new APIError(400, "Only JPEG, PNG, and WebP images are allowed"))
    }
    cb(null, true)
}


const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
})

// exports
//   registration  → uploadSellerImages   (avatar required, banner optional)
//   avatar update → uploadSellerAvatar
//   banner update → uploadSellerBanner
//   product -> uploadProductImages (1-4)

export const uploadSellerImages = upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
])

export const uploadSellerAvatar = upload.single("avatar")

export const uploadSellerBanner = upload.single("banner")

export const uploadProductImages = upload.fields([
    { name: "images", maxCount: 4 }
])