import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
    try {
        // Add debug logging
        console.log('Cloudinary Config:', {
            cloud_name: process.env.CLOUDINARY_NAME ? 'Present' : 'Missing',
            api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
            api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
        });

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });
        console.log('Cloudinary connected successfully');
    } catch (error) {
        console.error('Cloudinary connection error:', error);
    }
}

export default connectCloudinary;
