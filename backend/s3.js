// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';
// import multer from 'multer';

// dotenv.config();


// const s3Client = new S3Client({
//     region: process.env.B2_REGION || 'us-east-005',
//     endpoint: process.env.B2_ENDPOINT || `https://s3.us-east-005.backblazeb2.com`,
//     credentials: {
//         accessKeyId: process.env.B2_APPLICATION_KEY_ID,
//         secretAccessKey: process.env.B2_APPLICATION_KEY,
//     },
// });

// // Configure multer for file uploads
// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
// });

// const generateSignedUrl = async (bucketName, fileId, fileType) => {
//     const command = new PutObjectCommand({
//         Bucket: bucketName,
//         Key: fileId,
//         ContentType: fileType,
//     });

//     const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
//     // Use Backblaze's friendly download URL
//     const downloadHost = process.env.B2_DOWNLOAD_HOST || 'f005.backblazeb2.com';
//     const objectUrl = `https://${downloadHost}/file/${bucketName}/${fileId}`;
//     return { signedUrl: url, objectUrl };
// };

// // Proxy upload function for local development (avoids CORS)
// const uploadFileToB2 = async (fileBuffer, fileName, mimeType) => {
//     const bucketName = process.env.B2_BUCKET_NAME;
//     const fileId = `${uuidv4()}/${fileName}`;

//     const command = new PutObjectCommand({
//         Bucket: bucketName,
//         Key: fileId,
//         Body: fileBuffer,
//         ContentType: mimeType,
//     });

//     try {
//         await s3Client.send(command);
//         const downloadHost = process.env.B2_DOWNLOAD_HOST || 'f005.backblazeb2.com';
//         const objectUrl = `https://${downloadHost}/file/${bucketName}/${fileId}`;
//         return { fileId, objectUrl };
//     } catch (error) {
//         console.error('Error uploading to B2:', error);
//         throw error;
//     }
// };

// const getSignedUrls = async (req, res) => {
//     const { files } = req.body; // Expecting an array of files with fileName and fileType
//     console.log('📥 Received files:', files);

//     // Validate file types (allow common safe types)
//     const allowedTypes = [
//         'image/jpeg', 'image/png', 'image/gif', 'image/webp',
//         'application/pdf',
//         'text/plain', 'text/csv',
//         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         'application/zip', 'application/x-rar-compressed',
//         'video/mp4', 'audio/mpeg'
//     ];

//     const invalidFiles = files.filter(file => !allowedTypes.includes(file.fileType));
//     if (invalidFiles.length > 0) {
//         console.log('❌ Invalid file types:', invalidFiles);
//         return res.status(400).json({
//             message: 'Unsupported file type(s): ' + invalidFiles.map(f => f.fileName).join(', ')
//         });
//     }

//     const bucketName = process.env.B2_BUCKET_NAME;
//     console.log('🪣 Using bucket:', bucketName);

//     try {
//         const signedUrls = await Promise.all(files.map(async (file) => {
//             const fileId = `${uuidv4()}/${file.fileName}`;
//             console.log('🔗 Generating signed URL for file:', file.fileName, 'with ID:', fileId);
//             const { signedUrl, objectUrl } = await generateSignedUrl(bucketName, fileId, file.fileType);
//             console.log('✅ Generated URLs for', file.fileName, ':', { signedUrl: signedUrl.substring(0, 50) + '...', objectUrl });
//             return { fileId, signedUrl, objectUrl };
//         }));

//         console.log('🎉 Successfully generated signed URLs for', signedUrls.length, 'files');
//         res.status(200).json(signedUrls);
//     } catch (error) {
//         console.error('❌ Error while generating signed URLs', error.message);
//         console.error('🔍 Full error:', error);
//         res.status(500).json({ message: error.message });
//     }
// };



// export { getSignedUrls };

// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';

// dotenv.config();

// /**
//  * Backblaze B2 (S3-compatible) client
//  */
// const s3Client = new S3Client({
//   region: process.env.B2_REGION || 'us-east-005',
//   endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
//   credentials: {
//     accessKeyId: process.env.B2_KEY_ID,
//     secretAccessKey: process.env.B2_APP_KEY,
//   },
// });

// /**
//  * Generate signed upload URL + public download URL
//  */
// const generateSignedUrl = async (bucketName, fileKey, fileType) => {
//   const command = new PutObjectCommand({
//     Bucket: bucketName,
//     Key: fileKey,
//     ContentType: fileType,
//   });

//   const signedUrl = await getSignedUrl(s3Client, command, {
//     expiresIn: 300, // 5 minutes
//   });

//   const downloadHost = process.env.B2_DOWNLOAD_HOST || 'f005.backblazeb2.com';
//   const objectUrl = `https://${downloadHost}/file/${bucketName}/${fileKey}`;

//   return { signedUrl, objectUrl };
// };

// /**
//  * API handler: generate signed URLs for frontend
//  */
// const getSignedUrls = async (req, res) => {
//   const { files } = req.body;

//   if (!Array.isArray(files) || files.length === 0) {
//     return res.status(400).json({ message: 'No files provided' });
//   }

//   const allowedTypes = [
//     'image/jpeg', 'image/png', 'image/gif', 'image/webp',
//     'application/pdf',
//     'text/plain', 'text/csv',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-excel',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'application/zip', 'application/x-rar-compressed',
//     'video/mp4', 'audio/mpeg'
//   ];

//   const invalid = files.filter(f => !allowedTypes.includes(f.fileType));
//   if (invalid.length > 0) {
//     return res.status(400).json({
//       message: 'Unsupported file type(s)',
//       files: invalid.map(f => f.fileName),
//     });
//   }

//   try {
//     const bucketName = process.env.B2_BUCKET_NAME;

//     const result = await Promise.all(
//       files.map(async (file) => {
//         const fileKey = `${uuidv4()}/${file.fileName}`;
//         const { signedUrl, objectUrl } = await generateSignedUrl(
//           bucketName,
//           fileKey,
//           file.fileType
//         );

//         return { fileKey, signedUrl, objectUrl };
//       })
//     );

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error('❌ Signed URL error:', err);
//     return res.status(500).json({ message: 'Failed to generate signed URLs' });
//   }
// };

// export { getSignedUrls };

// import { 
//   S3Client, 
//   PutObjectCommand, 
//   GetObjectCommand 
// } from '@aws-sdk/client-s3';

// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';

// dotenv.config();

// /**
//  * Backblaze B2 (S3-compatible) client
//  */
// const s3Client = new S3Client({
//   region: process.env.B2_REGION || 'us-east-005',
//   endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
//   credentials: {
//     accessKeyId: process.env.B2_KEY_ID,
//     secretAccessKey: process.env.B2_APP_KEY,
//   },
// });

// /**
//  * Generate signed PUT (upload) URL
//  */
// const generateUploadUrl = async (bucketName, fileKey, fileType) => {
//   const command = new PutObjectCommand({
//     Bucket: bucketName,
//     Key: fileKey,
//     ContentType: fileType,
//   });

//   return await getSignedUrl(s3Client, command, {
//     expiresIn: 300, // 5 minutes
//   });
// };

// /**
//  * Generate signed GET (download) URL
//  */
// const generateDownloadUrl = async (bucketName, fileKey) => {
//   const command = new GetObjectCommand({
//     Bucket: bucketName,
//     Key: fileKey,
//   });

//   return await getSignedUrl(s3Client, command, {
//     expiresIn: 600, // 10 minutes
//   });
// };

// /**
//  * API handler
//  * Generates signed upload + download URLs
//  */
// const getSignedUrls = async (req, res) => {
//   const { files } = req.body;

//   if (!Array.isArray(files) || files.length === 0) {
//     return res.status(400).json({ message: 'No files provided' });
//   }

//   const allowedTypes = [
//     'image/jpeg', 'image/png', 'image/gif', 'image/webp',
//     'application/pdf',
//     'text/plain', 'text/csv',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-excel',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'application/zip', 'application/x-rar-compressed',
//     'video/mp4', 'audio/mpeg'
//   ];

//   const invalidFiles = files.filter(f => !allowedTypes.includes(f.fileType));
//   if (invalidFiles.length > 0) {
//     return res.status(400).json({
//       message: 'Unsupported file type(s)',
//       files: invalidFiles.map(f => f.fileName),
//     });
//   }

//   try {
//     const bucketName = process.env.B2_BUCKET_NAME;

//     const result = await Promise.all(
//       files.map(async (file) => {
//         const fileKey = `${uuidv4()}/${file.fileName}`;

//         const uploadUrl = await generateUploadUrl(
//           bucketName,
//           fileKey,
//           file.fileType
//         );

//         const downloadUrl = await generateDownloadUrl(
//           bucketName,
//           fileKey
//         );

//         return {
//           fileKey,
//           uploadUrl,
//           downloadUrl
//         };
//       })
//     );

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('❌ Error generating signed URLs:', error);
//     return res.status(500).json({ message: 'Failed to generate signed URLs' });
//   }
// };

// export { getSignedUrls };

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generates a signature so the Frontend can upload directly to Cloudinary
 */
const getSignedUrls = async (req, res) => {
  try {
    // 1. Generate a timestamp (required by Cloudinary)
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 2. Create a secure signature using your API Secret
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        // If you want to organize files into a specific folder, uncomment below:
        // folder: 'file_transfer_app', 
      },
      process.env.CLOUDINARY_API_SECRET
    );

    // 3. Return the necessary auth data to the frontend
    res.status(200).json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });

  } catch (error) {
    console.error('❌ Error generating Cloudinary signature:', error);
    res.status(500).json({ message: 'Failed to generate signature' });
  }
};

export { getSignedUrls };