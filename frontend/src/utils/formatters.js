import { format, formatDistanceToNow, isValid } from "date-fns";


export const formatPrice = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};



export const formatDiscount = (price, discountedPrice) => {
    if (!discountedPrice || discountedPrice >= price) {
        return null;
    }

    const percentOff = Math.round(((price - discountedPrice) / price) * 100);

    return `${percentOff}% OFF`;
};

// dd mm yyyy
export const formatDate = (date) => {
    const d = new Date(date);
    return isValid(d) ? format(d, "dd MMM yyyy") : "—";
};


export const formatRelativeTime = (date) => {
    const d = new Date(date);
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "—";
};


export const truncate = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};


const PRODUCT_TYPE_LABELS = {
    tshirt: "T-Shirt",
    shirt: "Shirt",
    hoodie: "Hoodie",
    jacket: "Jacket",
    jeans: "Jeans",
    trouser: "Trouser",
    shorts: "Shorts",
    dress: "Dress",
    kurti: "Kurti",
    salwar: "Salwar",
    saree: "Saree",
    kurta: "Kurta",
};

export const formatProductType = (type) => PRODUCT_TYPE_LABELS[type] ?? type;

export const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const buildWhatsAppLink = (phoneNumber, message = "") => {

    const cleaned = phoneNumber.replace(/\D/g, "");

    const withCountryCode = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;

    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${withCountryCode}${message ? `?text=${encodedMessage}` : ""}`;
};


export const validateImageFile = (file, maxSizeMB = 5) => {

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        return "Only JPG, PNG, or WebP images are allowed";
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return `Image must be smaller than ${maxSizeMB}MB`;
    }
    return null;
};