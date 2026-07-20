import mongoose from "mongoose"

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    country: {
        type: String,
        trim: true,
        lowercase: true,
        default:"india"
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default:true
    },
    settings: {
        deliveryCharge: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        freeDeliveryAbove: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        allowedCOD: {
            type: Boolean,
            default: false
        },
        supportEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        supportPhone: {
            type: String,
            required: true,
            trim: true,
            match: [/^(?:\+91)?[6-9]\d{9}$/, 'Invalid mobile number']
        },
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: [true, "City Admin ID is required"],
    }

}, { timestamps: true })



// , staff, order,


export const City = mongoose.model('City', citySchema)

