var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import AWS from 'aws-sdk';
import { AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET_REGION } from './config.js';
const s3 = new AWS.S3({
    region: BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
    },
});
const uploadToS3 = (bucket, key, body, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield s3
            .putObject({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        })
            .promise();
    }
    catch (error) {
        throw new Error("Failed to upload file to S3");
    }
});
const generatePresignedDownloadUrl = (bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 60 * 5, // URL expires in 5 minutes
    };
    return s3.getSignedUrl('getObject', params);
};
export { s3, uploadToS3, generatePresignedDownloadUrl };
//# sourceMappingURL=s3.config.js.map