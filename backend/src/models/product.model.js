import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: [true, "Seller ID is required"],
            index: true,
        },

        productName: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: 3,
            maxlength: 150,
        },

        productDescription: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            maxlength: 2000,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },

        discountedPrice: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: function (val) {
                    return val === 0 || val < this.price;
                },
                message: "Discounted price must be less than original price"
            }
        },

        images: {
            type: [String],
            required: true,
            validate: [(arr) => arr.length >= 1 && arr.length <= 4,
                "Images must be between 1 and 4"]
        },

        gender: {
            type: String,
            enum: ["men", "women", "kids", "unisex"],
            required: true,
        },

        productType: {
            type: String,
            enum: [
                "tshirt",
                "shirt",
                "hoodie",
                "jacket",
                "jeans",
                "trouser",
                "shorts",
                "dress",
                "kurti",
                "salwar",
                "saree",
                "kurta"
            ],
            required: true,
        },

        color: {
            type: String,
            lowercase: true
        },

        brand: {
            type: String,
            trim: true,
        },

        variants: {
            type: [
                {
                    size: {
                        type: String,
                        enum: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"],
                        required: true,
                    },

                    quantity: {
                        type: Number,
                        required: true,
                        min: 0,
                        default: 0,
                    },
                },
            ],
            validate: {
                validator: arr => arr.length >= 1,
                message: "At least one size variant is required"
            }
        } ,

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        numReviews: {
            type: Number,
            default: 0,
        },

        // For future
        // soldCount: {
        //     type: Number,
        //     default: 0,
        // },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.index({ productType: 1 });
productSchema.index({ createdAt: -1 });
// productSchema.index({ soldCount: -1 });



export const Product = mongoose.model("Product", productSchema);