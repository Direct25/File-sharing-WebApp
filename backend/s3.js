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