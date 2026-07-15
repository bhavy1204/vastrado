import dotenv from "dotenv";
import mongoose from "mongoose";
import {Seller} from "../src/models/seller.model.js"

dotenv.config({ path: "../.env" });

await mongoose.connect(process.env.MONGODB_URL, {
    dbName: "clothmarket"
});

const AVATAR =
    "https://res.cloudinary.com/viidr5ld/image/upload/v1784004761/sellers/avatars/6a55c098f18ab078301cfb06-1784004760882.webp";

const sellers = [
    {
        fullName: "Rajesh Sharma",
        username: "rajeshsharma",
        shopName: "Sharma Fashion Hub",
        shopDescription:
            "Trendy men's and women's clothing at affordable prices.",
        shopCategory: "clothing",
        email: "rajesh@example.com",
        password: "Password@123",
        status: "approved",
        postalCode: "302001",
        addressLine1: "12 MI Road",
        addressLine2: "Near Panch Batti",
        location: {
            type: "Point",
            coordinates: [75.8319, 26.9048]
        },
        avatar: AVATAR,
        city: "jaipur",
        state: "rajasthan",
        country: "India",
        whatsappNumber: "9876543210",
        phone: "9876543210",
        altPhone: "9876543211",
        isEmailVerified: true,
        subscription: {
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    },
    {
        fullName: "Priya Gupta",
        username: "priyagupta",
        shopName: "Gupta Electronics",
        shopDescription:
            "Mobile accessories, speakers, chargers and gadgets.",
        shopCategory: "electronics",
        email: "priya@example.com",
        password: "Password@123",
        status: "approved",
        postalCode: "302004",
        addressLine1: "45 Raja Park",
        addressLine2: "Near Gurudwara",
        location: {
            type: "Point",
            coordinates: [75.8344, 26.9063]
        },
        avatar: AVATAR,
        city: "jaipur",
        state: "rajasthan",
        country: "India",
        whatsappNumber: "9876543222",
        phone: "9876543222",
        altPhone: "9876543223",
        isEmailVerified: true,
        subscription: {
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    },
    {
        fullName: "Amit Verma",
        username: "amitverma",
        shopName: "Verma Home Decor",
        shopDescription:
            "Furniture and home decor for modern homes.",
        shopCategory: "furniture",
        email: "amit@example.com",
        password: "Password@123",
        status: "approved",
        postalCode: "302017",
        addressLine1: "22 Malviya Nagar",
        addressLine2: "Near World Trade Park",
        location: {
            type: "Point",
            coordinates: [75.8361, 26.9026]
        },
        avatar: AVATAR,
        city: "jaipur",
        state: "rajasthan",
        country: "India",
        whatsappNumber: "9876543234",
        phone: "9876543234",
        altPhone: "9876543235",
        isEmailVerified: true,
        subscription: {
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    }
];

try {
    await Seller.deleteMany({
        username: {
            $in: sellers.map((s) => s.username)
        }
    });

    await Promise.all(
        sellers.map((seller) => Seller.create(seller))
    );
    console.log("✅ Demo sellers created successfully.");
} catch (err) {
    console.error(err);
} finally {
    await mongoose.disconnect();
}
