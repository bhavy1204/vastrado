import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const sellerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
    },
    shopName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    shopDescription: {
        type: String,
        trim: true
    },
    shopCategory: {
        type: String,
        enum: ['electronics', 'clothing', 'furniture', 'general'],
        default: 'clothing'
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    isOAuth: {
        type: Boolean,
        default: false
    },
    authProvider: {
        type: String
    },
    password: {
        type: String,
        required: function () {
            return !this.isOAuth;
        }
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        select: false
    },
    providerId: {
        type: String,
        unique: true,
        sparse: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    postalCode: {
        type: String,
        required: true
    },
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    avatar: {
        type: String,
        trim: true,
        default: process.env.DEFAULT_SELLER_AVATAR_URL
    },
    banner: {
        type: String,
        trim: true,
        default: process.env.DEFAULT_SELLER_BANNER_URL
    },
    city: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    country: {
        type: String,
        default: 'India'
    },
    whatsappNumber: {
        type: String,
        required: true,
        trim: true,
        match: [/^(?:\+91)?[6-9]\d{9}$/, 'Invalid mobile number']
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^(?:\+91)?[6-9]\d{9}$/, 'Invalid mobile number']
    },
    altPhone: {
        type: String,
        trim: true,
        match: [/^(?:\+91)?[6-9]\d{9}$/, 'Invalid mobile number']
    },
    subscription: {
        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "cancelled",
                "expired",
                "pending"
            ],
            default: "inactive"
        },

        planId: {
            type: String,
            default: null
        },

        razorpaySubscriptionId: {
            type: String,
            default: null
        },

        startDate: {
            type: Date,
            default: null
        },

        endDate: {
            type: Date,
            default: null
        },

        lastPaymentDate: {
            type: Date,
            default: null
        },

        nextBillingDate: {
            type: Date,
            default: null
        }
    },
}, { timestamps: true })

sellerSchema.index({ location: "2dsphere" })

sellerSchema.pre("save", async function (next) {

    if ( this.isNew || this.isModified("shopName") ) {
        let baseSlug = this.shopName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')

        let slug = baseSlug
        let count = 1

        while (await Seller.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${this.city.toLowerCase()}`
            if (count > 1) slug = `${baseSlug}-${count}`
            count++
        }

        this.slug = slug
    }

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})

sellerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


sellerSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        type: 'seller',
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

sellerSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        type: 'seller',
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const Seller = mongoose.model("Seller", sellerSchema);