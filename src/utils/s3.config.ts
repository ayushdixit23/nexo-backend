import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET_REGION } from "./config";

const s3 = new S3Client({
  region: BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const uploadToS3 = async (
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> => {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  } catch (error) {
    throw new Error("Failed to upload file to S3");
  }
};

export { s3, uploadToS3 };
