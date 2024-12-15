import AWS from 'aws-sdk';
import { AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET_REGION } from './config';

const s3 = new AWS.S3({
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
    await s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
      .promise();
  } catch (error) {
    throw new Error("Failed to upload file to S3");
  }
};

const generatePresignedDownloadUrl = (bucketName: string, key: string) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: 60 * 5,  // URL expires in 5 minutes
  };

  return s3.getSignedUrl('getObject', params);
};


export { s3, uploadToS3,generatePresignedDownloadUrl };
