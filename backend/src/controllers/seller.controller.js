import jwt from "jsonwebtoken";
import slugify from "slugify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { OAuth2Client } from "google-auth-library";
import { sendOTPEmail } from "../utils/email.js";
import { Seller } from "../models/seller.model.js";
import { Product } from "../models/product.model.js";
import { OTP } from "../models/otp.model.js";
import { uploadToB2, deleteFromB2 } from "../utils/b2.js";
import sharp from "sharp";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helpers

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};

const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = async (seller) => {
    const accessToken = seller.generateAccessToken();
    const refreshToken = seller.generateRefreshToken();
    seller.refreshToken = refreshToken;
    await seller.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const processAndUploadImage = async (buffer, folder, filename) => {
    const webpBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

    const key = `${folder}/${filename}-${Date.now()}.webp`;
    const url = await uploadToB2(webpBuffer, key, "image/webp");
    return { url, key };
};

// controllers

const registerSeller = asyncHandler(async (req, res) => {
    const {
        fullName, username, shopName, shopDescription, shopCategory,
        email, password, phone, whatsappNumber, altPhone,
        addressLine1, addressLine2, city, state, postalCode, location
    } = req.body;

    const [existingEmail, existingUsername] = await Promise.all([
        Seller.findOne({ email }),
        Seller.findOne({ username }),
    ]);

    if (existingEmail)
        throw new APIError(409, "Email is already registered");
    if (existingUsername)
        throw new APIError(409, "Username is already taken");


    const seller = await Seller.create({
        fullName, username, shopName, shopDescription,
        shopCategory, email, password, phone, whatsappNumber,
        altPhone, addressLine1, addressLine2, city, state,
        postalCode, location,
        slug: `${slugify(shopName, { lower: true, strict: true })}-placeholder`,
    });


    // _id suffix 
    seller.slug = `${slugify(shopName, { lower: true, strict: true })}-${seller._id}`;


    if (req.files?.avatar?.[0]) {
        const { url } = await processAndUploadImage(
            req.files.avatar[0].buffer,
            "sellers/avatars",
            seller._id.toString()
        );
        seller.avatar = url;
    }

    if (req.files?.banner?.[0]) {
        const { url } = await processAndUploadImage(
            req.files.banner[0].buffer,
            "sellers/banners",
            seller._id.toString()
        );
        seller.banner = url;
    }

    await seller.save({ validateBeforeSave: false });

    const otp = generateOTP();
    console.log("OTP FOR SELLER >>>>> ", otp);
    await OTP.findOneAndDelete({ email, purpose: "email-verification" });
    await OTP.create({
        email, otp, purpose: "email-verification",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOTPEmail(email, otp, "email-verification");

    return res.status(201).json(
        new APIResponse(201, { _id: seller._id, email: seller.email },
            "Account created successfully. Please verify your email.")
    );
});


const verifySellerEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, purpose: "email-verification" });

    if (!otpRecord) {
        throw new APIError(400, "OTP expired or not found. Please request a new one.");
    }

    if (otpRecord.attempts >= 5) {
        await OTP.findByIdAndDelete(otpRecord._id);
        throw new APIError(429, "Too many incorrect attempts. Please request a new OTP.");
    }

    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new APIError(400, `Incorrect OTP. ${5 - otpRecord.attempts} attempts remaining.`);
    }

    await Seller.findOneAndUpdate({ email }, { isEmailVerified: true });

    await OTP.findByIdAndDelete(otpRecord._id);

    return res.status(200).json(
        new APIResponse(200, null, "Email verified successfully. Wait for admin approval before logging in.")
    );
});



const resendSellerOTP = asyncHandler(async (req, res) => {

    const { email, purpose } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller)
        throw new APIError(404, "No account found with this email");

    if (purpose === "email-verification" && seller.isEmailVerified) {
        throw new APIError(400, "Email is already verified");
    }

    const existingOTP = await OTP.findOne({ email, purpose });
    if (existingOTP) {
        const ageInSeconds = (Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000;
        if (ageInSeconds < 60) {
            throw new APIError(429, "Please wait 1 minute before requesting a new OTP");
        }
        await OTP.findByIdAndDelete(existingOTP._id);
    }

    const otp = generateOTP();
    await OTP.create({
        email, otp, purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOTPEmail(email, otp, purpose);

    return res.status(200).json(
        new APIResponse(200, null, "OTP sent successfully")
    );
});


const loginSeller = asyncHandler(async (req, res) => {

    const { identifier, password } = req.body;

    const isEmail = identifier.includes("@");

    const seller = await Seller.findOne(
        isEmail ? { email: identifier } : { username: identifier }
    ).select("+password +refreshToken");

    if (!seller)
        throw new APIError(401, "Invalid credentials");

    if (seller.isOAuth) {
        throw new APIError(400, "This account uses Google sign-in. Please login with Google.");
    }

    if (!seller.isEmailVerified) {
        throw new APIError(403, "Please verify your email before logging in.");
    }

    if (seller.status === "pending" || seller.status === "suspended") {
        throw new APIError(403, "Your account is pending admin approval.");
    }

    const isPasswordValid = await seller.isPasswordCorrect(password);

    if (!isPasswordValid)
        throw new APIError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateTokens(seller);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(new APIResponse(200,
            { _id: seller._id, shopName: seller.shopName, email: seller.email, slug: seller.slug },
            "Logged in successfully"
        ));
});


const logoutSeller = asyncHandler(async (req, res) => {
    await Seller.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new APIResponse(200, null, "Logged out successfully"));
});


const refreshSellerAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new APIError(401, "Refresh token is required");
    }

    let decoded;


    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new APIError(401, "Invalid or expired refresh token");
    }

    if (decoded.type !== "seller") {
        throw new APIError(401, "Invalid token type");
    }

    const seller = await Seller.findById(decoded._id).select("+refreshToken");

    if (!seller || seller.refreshToken !== incomingRefreshToken) {
        throw new APIError(401, "Refresh token is invalid or has been revoked");
    }

    const { accessToken, refreshToken } = await generateTokens(seller);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(new APIResponse(200, null, "Access token refreshed successfully"));
});


const forgotSellerPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller || seller.isOAuth) {
        return res.status(200).json(
            new APIResponse(200, null, "If this email is registered, an OTP has been sent.")
        );
    }

    const otp = generateOTP();
    await OTP.findOneAndDelete({ email, purpose: "forgot-password" });
    await OTP.create({
        email, otp, purpose: "forgot-password",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOTPEmail(email, otp, "forgot-password");

    return res.status(200).json(
        new APIResponse(200, null, "If this email is registered, an OTP has been sent.")
    );
});


const resetSellerPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OTP.findOne({ email, purpose: "forgot-password" });

    if (!otpRecord) {
        throw new APIError(400, "OTP expired or not found. Please request a new one.");
    }

    if (otpRecord.attempts >= 5) {
        await OTP.findByIdAndDelete(otpRecord._id);
        throw new APIError(429, "Too many incorrect attempts. Please request a new OTP.");
    }

    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new APIError(400, `Incorrect OTP. ${5 - otpRecord.attempts} attempts remaining.`);
    }

    const seller = await Seller.findOne({ email });
    if (!seller)
        throw new APIError(404, "Seller not found");


    seller.password = newPassword;

    seller.refreshToken = undefined;

    await seller.save();

    await OTP.findByIdAndDelete(otpRecord._id);

    return res.status(200).json(
        new APIResponse(200, null, "Password reset successfully. Please login again.")
    );
});


const changeSellerPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const seller = await Seller.findById(req.user._id).select("+password");
    if (!seller) throw new APIError(404, "Seller not found");

    if (seller.isOAuth) {
        throw new APIError(400, "OAuth accounts cannot change password");
    }

    const isPasswordValid = await seller.isPasswordCorrect(currentPassword);

    if (!isPasswordValid)
        throw new APIError(401, "Current password is incorrect");

    if (currentPassword === newPassword) {
        throw new APIError(400, "New password must be different from current password");
    }

    seller.password = newPassword;
    seller.refreshToken = undefined;
    await seller.save();

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new APIResponse(200, null, "Password changed successfully. Please login again."));
});


const getSellerPublicProfile = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const seller = await Seller.findOne({ slug, status: "approved" })
        .select("fullName shopName shopDescription shopCategory avatar banner city state whatsappNumber slug averageRating status phone createdAt")
        .lean();

    if (!seller)
        throw new APIError(404, "Shop not found");

    const products = await Product.find({ sellerId: seller._id, isActive: true })
        .select("productName slug price discountedPrice images averageRating numReviews")
        .sort({ createdAt: -1 })
        .lean();

    seller.productCount = products.length;

    return res.status(200).json(
        new APIResponse(200, { seller, products }, "Shop profile fetched successfully")
    );
});


const getSellerDashboard = asyncHandler(async (req, res) => {
    const sellerId = req.user._id;

    const [totalProducts, activeProducts, seller] = await Promise.all([
        Product.countDocuments({ sellerId }),
        Product.countDocuments({ sellerId, isActive: true }),
        Seller.findById(sellerId).select("subscription shopName").lean(),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            shopName: seller.shopName,
            totalProducts,
            activeProducts,
            subscription: {
                status: seller.subscription.status,
                nextBillingDate: seller.subscription.nextBillingDate,
                endDate: seller.subscription.endDate,
            }
        }, "Dashboard fetched successfully")
    );
});

const updateSellerProfile = asyncHandler(async (req, res) => {
    const allowedFields = [
        "fullName", "shopName", "shopDescription", "shopCategory",
        "phone", "whatsappNumber", "altPhone",
        "addressLine1", "addressLine2", "city", "state", "postalCode"
    ];

    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // if shopName is changing regenerating slug as well
    if (updates.shopName) {
        updates.slug = `${slugify(updates.shopName, { lower: true, strict: true })}-${req.user._id}`;
    }

    const seller = await Seller.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-password -refreshToken -authId");

    return res.status(200).json(
        new APIResponse(200, seller, "Profile updated successfully")
    );
});

// ─── UPDATE AVATAR ────────────────────────────────────────────────────────────

const updateSellerAvatar = asyncHandler(async (req, res) => {
    if (!req.file) throw new APIError(400, "Avatar image is required");

    const seller = await Seller.findById(req.user._id).select("avatar");

    const { url } = await processAndUploadImage(
        req.file.buffer,
        "sellers/avatars",
        req.user._id.toString()
    );

    if (seller.avatar && seller.avatar !== process.env.DEFAULT_SELLER_AVATAR_URL) {
        const oldKey = seller.avatar.split("/").slice(-2).join("/");
        await deleteFromB2(oldKey).catch(() => { });
    }

    seller.avatar = url;
    await seller.save({ validateBeforeSave: false });

    return res.status(200).json(
        new APIResponse(200, { avatar: url }, "Avatar updated successfully")
    );
})



const updateSellerBanner = asyncHandler(async (req, res) => {
    if (!req.file) throw new APIError(400, "Banner image is required");

    const seller = await Seller.findById(req.user._id).select("banner");

    const { url } = await processAndUploadImage(
        req.file.buffer,
        "sellers/banners",
        req.user._id.toString()
    );

    if (seller.banner && seller.banner !== process.env.DEFAULT_SELLER_BANNER_URL) {
        const oldKey = seller.banner.split("/").slice(-2).join("/");
        await deleteFromB2(oldKey).catch(() => { });
    }

    seller.banner = url;

    await seller.save({ validateBeforeSave: false });

    return res.status(200).json(
        new APIResponse(200, { banner: url }, "Banner updated successfully")
    );
});


const updateShopLocation = asyncHandler(async (req, res) => {
    const { coordinates } = req.body; // [lng, lat]

    const seller = await Seller.findByIdAndUpdate(
        req.user._id,
        { $set: { location: { type: "Point", coordinates } } },
        { new: true, runValidators: true }
    ).select("location");

    return res.status(200).json(
        new APIResponse(200, { location: seller.location }, "Shop location updated successfully")
    );
});

// for customers
const getNearbySellers = asyncHandler(async (req, res) => {
    const { lng, lat, radius } = req.query;

    if (!lng || !lat) {
        throw new APIError(400, "Longitude and latitude are required");
    }

    const radiusInMeters = Math.min(
        parseFloat(radius) * 1000 || 5000, // default 5km
        10000                               // hard cap at 10km
    );

    const sellers = await Seller.find({
        status:"approved",
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)],
                },
                $maxDistance: radiusInMeters,
            },
        },
    })
        .select("shopName slug avatar city shopCategory location whatsappNumber")
        .limit(50)
        .lean();

    return res.status(200).json(
        new APIResponse(200, { count: sellers.length, sellers }, "Nearby sellers fetched successfully")
    );
});

const getSellerSubscription = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.user._id).select("subscription").lean();

    return res.status(200).json(
        new APIResponse(200, seller.subscription, "Subscription details fetched successfully")
    );
});

export {
    registerSeller,
    loginSeller,
    logoutSeller,
    refreshSellerAccessToken,
    verifySellerEmail,
    resendSellerOTP,
    forgotSellerPassword,
    resetSellerPassword,
    changeSellerPassword,
    getSellerPublicProfile,
    getSellerDashboard,
    updateSellerProfile,
    updateSellerAvatar,
    updateSellerBanner,
    updateShopLocation,
    getNearbySellers,
    getSellerSubscription,
};