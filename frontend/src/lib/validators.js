import { z } from "zod";


const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

const passwordSchema = z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[0-9]/, "Must contain at least one number");

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number");

const otpSchema = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric");

const optionalString = z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().trim().optional()
);

export const userRegisterSchema = z.object({
    fullName: z.string().trim().min(2, "Name is too short").max(60),
    email: emailSchema,
    password: passwordSchema,
});

export const userLoginSchema = z.object({
    identifier: z.string().trim().min(1, "Email or username is required"),
    password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
    email: emailSchema,
    otp: otpSchema,
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const addressSchema = z.object({
    label: z.string().trim().min(1, "Label is required"),
    addressLine1: z.string().trim().min(5, "Address is too short"),
    addressLine2: optionalString,
    landmark: optionalString,
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    postalCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit postal code"),
    country: z.literal("India"),
    phone: phoneSchema,
    isDefault: z.boolean().optional(),
});

export const sellerRegisterSchema = z
    .object({
        shopName: z.string().trim().min(2, "Shop name is required").max(80),
        username: z
            .string()
            .trim()
            .toLowerCase()
            .min(3, "Username too short")
            .max(30)
            .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscores"),
        email: emailSchema,
        phone: phoneSchema,
        fullName: z.string().trim().min(2, "Name is too short").max(60),
        altPhone: phoneSchema,
        shopCategory: z.string().trim(),
        whatsappNumber: phoneSchema,
        addressLine1: z.string(),
        addressLine2: z.string(),
        city: z.string().trim(),
        state: z.string().trim(),
        postalCode: z.string().trim(),
        shopDescription: z.string().trim().max(500).optional(),
        password: passwordSchema,
        googleMapLink:optionalString,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });


export const sellerLoginSchema = z.object({
    identifier: z.string().trim().min(1, "Email or username is required"),
    password: z.string().min(1, "Password is required"),
});


export const sellerProfileUpdateSchema = z.object({
    fullName: z.string().trim().min(2).max(60).optional(),
    shopName: z.string().trim().min(2).max(80).optional(),
    shopDescription: z.string().trim().max(500).optional(),
    shopCategory: z.string().trim().optional(),
    phone: phoneSchema.optional(),
    whatsappNumber: phoneSchema.optional(),
    altPhone: phoneSchema.optional().or(z.literal("")),
    addressLine1: z.string().trim().min(5).optional(),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(2).optional(),
    state: z.string().trim().min(2).optional(),
    postalCode: z.string().regex(/^\d{6}$/).optional(),
});


export const createProductSchema = z.object({
    productName: z.string().trim().min(2, "Product name is required").max(120),
    productDescription: z.string().trim().min(10, "Description too short").max(2000),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountedPrice: z.preprocess(
        (value) => (value === "" ? undefined : Number(value)),
        z.number().min(0).optional()
    ),
    gender: z.enum(["men", "women", "kids", "unisex"]),
    productType: z.string().trim().min(1, "Select a product type"),
    color: z.string().trim().min(1, "Color is required"),
    brand: z.preprocess(
        (value) => value === "" ? undefined : value,
        z.string().trim().optional()
    ),
    variants: z.array(
        z.object({
            size: z.string().trim().min(1, "Size is required"),
            quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
        })
    )
        .min(1, "Add at least one variant"),
})
    .refine(
        (data) =>
            data.discountedPrice === undefined || data.discountedPrice < data.price,
        {
            message: "Discounted price must be less than original price",
            path: ["discountedPrice"],
        }
    );

export const updateProductSchema = z.object({
    productName: z.string().trim().min(2).max(120).optional(),
    productDescription: z.string().trim().min(10).max(2000).optional(),
    price: z.coerce.number().positive().optional(),
    discountedPrice: optionalString,
    variants: z
        .array(
            z.object({
                size: z.string().trim().min(1),
                quantity: z.coerce.number().int().min(0),
            })
        )
        .optional(),
});



export const reviewSchema = z.object({
    rating: z.coerce.number().int().min(1, "Rating is required").max(5),
    comment: z.string().trim().min(5, "Comment too short").max(500),
});



export const faqSchema = z.object({
    question: z.string().trim().min(5, "Question is too short").max(300),
    answer: z.string().trim().min(5, "Answer is too short").max(1000),
});



