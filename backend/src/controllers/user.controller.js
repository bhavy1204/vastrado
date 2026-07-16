import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { Product } from "../models/product.model.js";
import { OAuth2Client } from "google-auth-library";
import { sendOTPEmail } from "../utils/email.js"

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper funstions

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

// controllers 

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new APIError(409, "Email is already registered");
    }

    const user = await User.create({ fullName, email, password });


    // send OTP
    const otp = generateOTP();

    await OTP.findOneAndDelete({ email, purpose: "email-verification" });

    await OTP.create({
        email,
        otp,
        purpose: "email-verification",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(email, otp, "email-verification");

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res.status(201).json(
        new APIResponse(
            201,
            createdUser,
            "Account created successfully. Please verify your email."
        )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
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

    await User.findOneAndUpdate({ email }, { isEmailVerified: true });
    await OTP.findByIdAndDelete(otpRecord._id);

    return res.status(200).json(
        new APIResponse(200, null, "Email verified successfully")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    const user = await User.findOne({ email: identifier }).select("+password +refreshToken");

    if (!user) {
        throw new APIError(401, "Invalid email or password");
    }

    if (user.isOAuth) {
        throw new APIError(400, "This account uses Google sign-in. Please login with Google.");
    }

    if (!user.isEmailVerified) {
        throw new APIError(403, "Please verify your email before logging in.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new APIError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(
            new APIResponse(
                200,
                { _id: user._id, fullName: user.fullName, email: user.email },
                "Logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new APIError(401, "Refresh token is required");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new APIError(401, "Invalid or expired refresh token");
    }

    if (decoded.type !== "user") {
        throw new APIError(401, "Invalid token type");
    }

    const user = await User.findById(decoded._id).select("+refreshToken");

    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new APIError(401, "Refresh token is invalid or has been revoked");
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(new APIResponse(200, null, "Access token refreshed successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.isOAuth) {
        return res.status(200).json(
            new APIResponse(200, null, "If this email is registered, an OTP has been sent.")
        );
    }

    const otp = generateOTP();
    await OTP.findOneAndDelete({ email, purpose: "forgot-password" });
    await OTP.create({
        email,
        otp,
        purpose: "forgot-password",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(email, otp, "forgot-password");

    return res.status(200).json(
        new APIResponse(200, null, "If this email is registered, an OTP has been sent.")
    );
});


const resetPassword = asyncHandler(async (req, res) => {
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

    const user = await User.findOne({ email });
    if (!user) {
        throw new APIError(404, "User not found");
    }

    user.password = newPassword; // pre-save hook handles hashing
    user.refreshToken = undefined; // invalidate all sessions on password reset
    await user.save();

    await OTP.findByIdAndDelete(otpRecord._id);

    return res.status(200).json(
        new APIResponse(200, null, "Password reset successfully. Please login again.")
    );
});

const resendOTP = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError(404, "No account found with this email");
    }

    if (purpose === "email-verification" && user.isEmailVerified) {
        throw new APIError(400, "Email is already verified");
    }

    // rate limit: block if a fresh OTP (< 1 min old) already exists
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
        email,
        otp,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(email, otp, purpose);

    return res.status(200).json(
        new APIResponse(200, null, "OTP sent successfully")
    );
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        throw new APIError(404, "User not found");
    }

    if (user.isOAuth) {
        throw new APIError(400, "OAuth accounts cannot change password");
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new APIError(401, "Current password is incorrect");
    }

    if (currentPassword === newPassword) {
        throw new APIError(400, "New password must be different from current password");
    }

    user.password = newPassword; // pre-save hook handles hashing
    user.refreshToken = undefined; // invalidate all sessions
    await user.save();

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new APIResponse(200, null, "Password changed successfully. Please login again."));
});


const getUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new APIError(404, "User not found");
    }

    return res.status(200).json(
        new APIResponse(200, user, "Profile fetched successfully")
    );
});


const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName } },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new APIResponse(200, user, "Profile updated successfully")
    );
});


const addAddress = asyncHandler(async (req, res) => {
    const { label, addressLine1, addressLine2, landmark, city, state, postalCode, country, phone, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    if (user.addresses.length >= 5) {
        throw new APIError(400, "Maximum of 5 addresses allowed");
    }

    // if new address is default, unset all others
    if (isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
        label, addressLine1, addressLine2,
        landmark, city, state, postalCode,
        country: country || "India",
        phone, isDefault: isDefault || false
    });

    await user.save();

    return res.status(201).json(
        new APIResponse(201, user.addresses, "Address added successfully")
    );
});

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);

    if (!address) {
        throw new APIError(404, "Address not found");
    }

    // if updating to default, unset others first
    if (updates.isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, updates);
    await user.save();

    return res.status(200).json(
        new APIResponse(200, user.addresses, "Address updated successfully")
    );
});

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);

    if (!address) {
        throw new APIError(404, "Address not found");
    }

    address.deleteOne();
    await user.save();

    return res.status(200).json(
        new APIResponse(200, user.addresses, "Address deleted successfully")
    );
});

const setDefaultAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);

    if (!address) {
        throw new APIError(404, "Address not found");
    }

    user.addresses.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true;
    await user.save();

    return res.status(200).json(
        new APIResponse(200, user.addresses, "Default address updated successfully")
    );
});

// ─── WISHLIST CONTROLLERS ─────────────────────────────────────────────────────

const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        throw new APIError(404, "Product not found");
    }

    const user = await User.findById(req.user._id);

    const alreadyInWishlist = user.wishlist.some(
        (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
        throw new APIError(400, "Product is already in your wishlist");
    }

    user.wishlist.push(productId);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new APIResponse(200, null, "Product added to wishlist")
    );
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { wishlist: productId } },
        { new: true }
    );

    return res.status(200).json(
        new APIResponse(200, null, "Product removed from wishlist")
    );
});

const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("wishlist")
        .populate({
            path: "wishlist",
            select: "productName slug price discountedPrice images isActive",
            match: { isActive: true }, // exclude delisted products
        });

    // populate returns null for deleted products — filter them out
    const wishlist = user.wishlist.filter(Boolean).map((product) => ({
        ...product.toObject(),
        images: product.images?.slice(0, 1) ?? [], // only first image for card
    }));

    return res.status(200).json(
        new APIResponse(200, wishlist, "Wishlist fetched successfully")
    );
});

// ─── OAUTH (GOOGLE) ───────────────────────────────────────────────────────────

const oAuthCallback = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new APIError(400, "Google ID token is required");
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch {
        throw new APIError(401, "Invalid Google token");
    }

    const { sub: providerId, email, name, email_verified } = payload;

    if (!email_verified) {
        throw new APIError(400, "Google account email is not verified");
    }

    // upsert: find existing user or create new one
    let user = await User.findOne({ email });

    if (user && !user.isOAuth) {
        throw new APIError(400, "This email is registered with a password. Please login with email and password.");
    }

    if (!user) {
        user = await User.create({
            fullName: name,
            email,
            isOAuth: true,
            authProvider: "google",
            providerId,
            isEmailVerified: true, // Google already verified it
        });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(
            new APIResponse(
                200,
                { _id: user._id, fullName: user.fullName, email: user.email },
                "Logged in with Google successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    resendOTP,
    changePassword,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    oAuthCallback,
};










