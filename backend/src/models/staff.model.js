import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const staffSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            index: true,
        },

        password: {
            type: String,
            required: true,
        },

        refreshToken: {
            type: String,
        },

        role: {
            type: String,
            enum: ["city-admin", "delivery-agent", "support-team"],
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "suspended"],
            default: "pending",
        },

        avatar: {
            type: String,
            trim: true,
            default: process.env.DEFAULT_STAFF_AVATAR_URL,
        },

        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: [true, "City ID is required"],
            index: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^(?:\+91)?[6-9]\d{9}$/, "Invalid mobile number"],
        },

        altPhone: {
            type: String,
            trim: true,
            match: [/^(?:\+91)?[6-9]\d{9}$/, "Invalid mobile number"],
        },
    },
    {
        timestamps: true,
    }
);

staffSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next;

    this.password = await bcrypt.hash(this.password, 10);
    next;
});

staffSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

staffSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "staff",
            role: this.role,
            cityId: this.cityId,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

staffSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "staff",
            role: this.role,
            cityId: this.cityId,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const Staff = mongoose.model("Staff", staffSchema);

