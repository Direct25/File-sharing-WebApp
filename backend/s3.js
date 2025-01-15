// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';
// import crypto from 'crypto';
// import { promisify } from 'util';


// dotenv.config();

// const randomBytes = promisify(crypto.randomBytes);

// const region = process.env.AWS_REGION;
// const bucketName = process.env.AWS_BUCKET_NAME;
// const accessKeyId = process.env.AWS_ACCESSKEYID;
// const secretAccessKey = process.env.AWS_SECRETACCESSKEY;




// const s3 = new aws.S3({
//     region,
//     accessKeyId,
//     secretAccessKey,
//     signatureVersion: "v4"
// })

// const generateSignedUrl = async (bucketName, fileId, fileType) => {
//     // const bytes = await randomBytes(16);
//     // const imageId = bytes.toString('hex');


//     const params = {
//         Bucket: bucketName,
//         Key: fileId, // Changed from imageId to fileId
//         Expires: 60,
//         ContentType: fileType // Add this line to specify the MIME type
//     }

//     const url = await s3.getSignedUrl('putObject', params);
//     return url;
// }
    
// const getSignedUrls = async (req, res) => {
//     const { files } = req.body; // Expecting an array of files with fileName and fileType
//     const bucketName = process.env.AWS_BUCKET_NAME;

//     try {
//         const signedUrls = await Promise.all(files.map(async (file) => {
//             const fileId = `${uuidv4()}/${file.fileName}`;
//             const url = await generateSignedUrl(bucketName, fileId, file.fileType);
//             return { fileId, url };
//         }));

//         res.status(200).json(signedUrls);
//     } catch (error) {
//         console.error('Error while generating signed URLs', error.message);
//         res.status(500).json({ message: error.message });
//     }
// }
// export default getSignedUrl;

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();


const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESSKEYID,
        secretAccessKey: process.env.AWS_SECRETACCESSKEY,
    },
});

const generateSignedUrl = async (bucketName, fileId, fileType) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileId,
        ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    const objectUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileId}`;
    return { signedUrl: url, objectUrl };
};

const getSignedUrls = async (req, res) => {
    const { files } = req.body; // Expecting an array of files with fileName and fileType
    const bucketName = process.env.AWS_BUCKET_NAME;

    try {
        const signedUrls = await Promise.all(files.map(async (file) => {
            const fileId = `${uuidv4()}/${file.fileName}`;
            const { signedUrl, objectUrl } = await generateSignedUrl(bucketName, fileId, file.fileType);
            // const url = await generateSignedUrl(bucketName, fileId, file.fileType);
            return { fileId, signedUrl, objectUrl }; 
        }));

        res.status(200).json(signedUrls);
    } catch (error) {
        console.error('Error while generating signed URLs', error.message);
        res.status(500).json({ message: error.message });
    }
};

// console.log('AWS_ACCESSKEYID:', process.env.AWS_ACCESSKEYID);
// console.log('AWS_SECRETACCESSKEY:', process.env.AWS_SECRETACCESSKEY);
// console.log('AWS_REGION:', process.env.AWS_REGION);
// console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

export { getSignedUrls };