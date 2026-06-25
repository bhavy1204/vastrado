import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.B2_REGION,
    endpoint: process.env.B2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID,
        secretAccessKey: process.env.B2_SECRET_KEY,
    },
});

export const uploadToB2 = async (buffer, key, mimeType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
    });

    await s3.send(command);

    return `${process.env.CDN_BASE_URL}/${key}`;
};

export const deleteFromB2 = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: key,
    });

    await s3.send(command);
};



