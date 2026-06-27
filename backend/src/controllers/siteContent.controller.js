import sharp from "sharp";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { HeroBanner, Faq } from "../models/heroBanner.model.js";
import { Seller } from "../models/seller.model.js";
import { uploadToB2 } from "../utils/b2.js";

// helper

const EXPIRY_DAYS = [1, 3, 10];

const processAndUploadBannerImage = async (buffer, folder, filename) => {
    const webpBuffer = await sharp(buffer)
        .resize({ width: 1440, withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();

    const key = `${folder}/${filename}-${Date.now()}.webp`;
    const url = await uploadToB2(webpBuffer, key, "image/webp");
    return url;
};

const calcExpiresAt = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

// Hero banners

// seller side

const createBannerRequest = asyncHandler(async (req, res) => {

    const seller = await Seller.findById(req.user?._id).select("isApproved subscription");

    if (!seller.isApproved) {
        throw new APIError(403, "Your account is pending admin approval");
    }

    if (seller.subscription.status !== "active") {
        throw new APIError(403, "An active subscription is required to request a banner");
    }

    if (!req.file) {
        throw new APIError(400, "Banner image is required");
    }

    const { title, description } = req.body;

    const imageUrl = await processAndUploadBannerImage(
        req.file.buffer,
        "banners",
        req.user._id.toString()
    );

    const banner = await HeroBanner.create({
        image: imageUrl,
        title: title || "",
        description: description || "",
        isSponsored: true,
        status: "pending",
        sellerId: req.user._id,
        // redirectUrl and expiresAt will be set by admin on approval
    });

    return res.status(201).json(
        new APIResponse(201, banner,
            "Banner request submitted. Admin will review and contact you for further details."
        )
    );
});


const getMyBanners = asyncHandler(async (req, res) => {

    const banners = await HeroBanner.find({ sellerId: req.user._id })
        .select("image title description status order isSponsored expiresAt createdAt")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new APIResponse(200, banners, "Your banner requests fetched successfully")
    );
});

// seller can only update title and description while the banner is is pending state. No image update for V1.

const updateBanner = asyncHandler(async (req, res) => {

    const { bannerId } = req.params;
    const { title, description } = req.body;

    const banner = await HeroBanner.findById(bannerId);

    if (!banner) {
        throw new APIError(404, "Banner not found");
    }

    if (banner.sellerId?.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You can only update your own banners");
    }

    if (banner.status !== "pending") {
        throw new APIError(400, "Only pending banners can be edited");
    }

    if (title !== undefined) {
        banner.title = title;
    }

    if (description !== undefined) {
        banner.description = description;
    }

    await banner.save();

    return res.status(200).json(
        new APIResponse(200, banner, "Banner updated successfully")
    );
});

// public side for image sliders

const getAllBanners = asyncHandler(async (req, res) => {
    const banners = await HeroBanner.find({ status: "approved" })
        .select("image title description redirectUrl order sellerId isSponsored")
        .populate("sellerId", "shopName slug")
        .sort({ order: 1 })
        .lean();

    return res.status(200).json(
        new APIResponse(200, banners, "Banners fetched successfully")
    );
});

// Admin side

const adminCreateBanner = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new APIError(400, "Banner image is required");
    }

    const { title, description, redirectUrl, expiryDays, order } = req.body;

    const parsedDays = parseInt(expiryDays);

    if (expiryDays && !EXPIRY_DAYS.includes(parsedDays)) {
        throw new APIError(400, `Expiry must be one of: ${EXPIRY_DAYS.join(", ")} days`);
    }

    const imageUrl = await processAndUploadBannerImage(
        req.file.buffer,
        "banners/admin",
        `admin-${Date.now()}`
    );

    const banner = await HeroBanner.create({
        image: imageUrl,
        title: title || "",
        description: description || "",
        redirectUrl: redirectUrl || "",
        isSponsored: false,
        status: "approved",
        order: order ? parseInt(order) : 0,
        expiresAt: expiryDays ? calcExpiresAt(parsedDays) : undefined,
    });

    return res.status(201).json(
        new APIResponse(201, banner, "Banner created successfully")
    );
});


const approveBanner = asyncHandler(async (req, res) => {

    const { bannerId } = req.params;
    const { redirectUrl, expiryDays, order } = req.body;

    const banner = await HeroBanner.findById(bannerId);

    if (!banner) {
        throw new APIError(404, "Banner not found");
    }

    if (banner.status === "approved") {
        throw new APIError(400, "Banner is already approved");
    }

    const parsedDays = parseInt(expiryDays);

    if (!EXPIRY_DAYS.includes(parsedDays)) {
        throw new APIError(400, `Expiry must be one of: ${EXPIRY_DAYS.join(", ")} days`);
    }

    banner.status = "approved";
    banner.redirectUrl = redirectUrl || "";
    banner.expiresAt = calcExpiresAt(parsedDays);
    banner.order = order ? parseInt(order) : 0;

    await banner.save();

    return res.status(200).json(
        new APIResponse(200, banner, "Banner approved successfully")
    );
});


const rejectBanner = asyncHandler(async (req, res) => {
    const { bannerId } = req.params;

    const banner = await HeroBanner.findById(bannerId);

    if (!banner) {
        throw new APIError(404, "Banner not found");
    }

    if (banner.status === "rejected") {
        throw new APIError(400, "Banner is already rejected");
    }

    banner.status = "rejected";
    await banner.save();

    return res.status(200).json(
        new APIResponse(200, { status: banner.status }, "Banner rejected")
    );
});


const adminUpdateBanner = asyncHandler(async (req, res) => {
    const { bannerId } = req.params;
    const { title, description, redirectUrl, expiryDays, order } = req.body;

    const banner = await HeroBanner.findById(bannerId);

    if (!banner) {
        throw new APIError(404, "Banner not found");
    }

    if (title !== undefined) {
        banner.title = title;
    }

    if (description !== undefined) {
        banner.description = description;
    }

    if (redirectUrl !== undefined) {
        banner.redirectUrl = redirectUrl;
    }

    if (order !== undefined) {
        banner.order = parseInt(order);
    }

    if (expiryDays !== undefined) {
        const parsedDays = parseInt(expiryDays);
        if (!EXPIRY_DAYS.includes(parsedDays)) {
            throw new APIError(400, `Expiry must be one of: ${EXPIRY_DAYS.join(", ")} days`);
        }
        banner.expiresAt = calcExpiresAt(parsedDays);
    }

    await banner.save();

    return res.status(200).json(
        new APIResponse(200, banner, "Banner updated successfully")
    );
});

const deleteBanner = asyncHandler(async (req, res) => {
    const { bannerId } = req.params;

    const banner = await HeroBanner.findById(bannerId);

    if (!banner) {
        throw new APIError(404, "Banner not found");
    }

    await HeroBanner.findByIdAndDelete(bannerId);

    return res.status(200).json(
        new APIResponse(200, { deletedBannerId: bannerId }, "Banner deleted successfully")
    );
});

// Reorder

const updateBannerOrder = asyncHandler(async (req, res) => {
    const { banners } = req.body; // [{ id, order }]

    if (!Array.isArray(banners) || banners.length === 0) {
        throw new APIError(400, "Banners array is required");
    }

    const bulkOps = banners.map(({ id, order }) => ({
        updateOne: {
            filter: { _id: id },
            update: { $set: { order: parseInt(order) } },
        },
    }));

    await HeroBanner.bulkWrite(bulkOps);

    return res.status(200).json(
        new APIResponse(200, null, "Banner order updated successfully")
    );
});

// active+ pending +rejected or optional

const adminGetAllBanners = asyncHandler(async (req, res) => {
    const { status } = req.query; // optional filter

    const filter = status ? { status } : {};

    const banners = await HeroBanner.find(filter)
        .populate("sellerId", "shopName email")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new APIResponse(200, banners, "All banners fetched successfully")
    );
});



// FAQ

// public side

const getAllFAQs = asyncHandler(async (req, res) => {

    const faqs = await Faq.find()
        .select("question answer createdAt")
        .sort({ createdAt: 1 })
        .lean();

    return res.status(200).json(
        new APIResponse(200, faqs, "FAQs fetched successfully")
    );
});

// Admin side

const createFAQ = asyncHandler(async (req, res) => {

    const { question, answer } = req.body;

    if (!question?.trim() || !answer?.trim()) {
        throw new APIError(400, "Question and answer are required");
    }

    const faq = await Faq.create({ question: question.trim(), answer: answer.trim() });

    return res.status(201).json(
        new APIResponse(201, faq, "FAQ created successfully")
    );
});


const updateFAQ = asyncHandler(async (req, res) => {
    const { faqId } = req.params;
    const { question, answer } = req.body;

    const faq = await Faq.findById(faqId);

    if (!faq) {
        throw new APIError(404, "FAQ not found");
    }

    if (question !== undefined) {
        faq.question = question.trim();
    }

    if (answer !== undefined) {
        faq.answer = answer.trim();
    }

    await faq.save();

    return res.status(200).json(
        new APIResponse(200, faq, "FAQ updated successfully")
    );
});


const deleteFAQ = asyncHandler(async (req, res) => {
    const { faqId } = req.params;

    const faq = await Faq.findById(faqId);

    if (!faq) {
        throw new APIError(404, "FAQ not found");
    }

    await Faq.findByIdAndDelete(faqId);

    return res.status(200).json(
        new APIResponse(200, { deletedFaqId: faqId }, "FAQ deleted successfully")
    );
});

export {
    // banner — seller
    createBannerRequest,
    getMyBanners,
    updateBanner,
    // banner — public
    getAllBanners,
    // banner — admin
    adminCreateBanner,
    adminUpdateBanner,
    adminGetAllBanners,
    approveBanner,
    rejectBanner,
    deleteBanner,
    updateBannerOrder,
    // faq — public
    getAllFAQs,
    // faq — admin
    createFAQ,
    updateFAQ,
    deleteFAQ,
};