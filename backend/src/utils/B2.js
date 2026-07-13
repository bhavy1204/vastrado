// import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// const s3 = new S3Client({
//     region: process.env.B2_REGION,
//     endpoint: process.env.B2_ENDPOINT,
//     credentials: {
//         accessKeyId: process.env.B2_ACCESS_KEY_ID,
//         secretAccessKey: process.env.B2_SECRET_KEY,
//     },
// });

// export const uploadToB2 = async (buffer, key, mimeType) => {
//     const command = new PutObjectCommand({
//         Bucket: process.env.B2_BUCKET_NAME,
//         Key: key,
//         Body: buffer,
//         ContentType: mimeType,
//     });

//     await s3.send(command);

//     return `${process.env.CDN_BASE_URL}/${key}`;
// };

// export const deleteFromB2 = async (key) => {
//     const command = new DeleteObjectCommand({
//         Bucket: process.env.B2_BUCKET_NAME,
//         Key: key,
//     });

//     await s3.send(command);
// };

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToB2 = async (buffer, key, mimeType) => {
    // Cloudinary manages file extensions itself, so strip it from the key
    // to use as public_id (keeps folder structure like "sellers/123/product1")
    const publicId = key.replace(/\.[^/.]+$/, "");

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                resource_type: "image",
                overwrite: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

export const deleteFromB2 = async (key) => {
    const publicId = key.replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};



