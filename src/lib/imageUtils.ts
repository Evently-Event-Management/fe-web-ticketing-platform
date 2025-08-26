import imageCompression from 'browser-image-compression';

// Default compression options
export const defaultCompressionOptions = {
    maxSizeMB: 1,          // Max file size in MB
    maxWidthOrHeight: 1920, // Max width or height in pixels
    useWebWorker: true,    // Use a web worker for better performance
    fileType: 'image/jpeg', // Force output to JPEG for better compression
};

/**
 * Interface for image compression options
 */
export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
}

/**
 * Compresses an image file on the client-side before uploading.
 * @param {File} imageFile The original image file to compress.
 * @param {CompressionOptions} options Optional compression options to override defaults.
 * @returns {Promise<File>} A promise that resolves with the compressed file.
 */
export const compressImage = async (
    imageFile: File,
    options?: CompressionOptions
): Promise<File> => {
    console.log(`Original file size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);

    // Merge provided options with defaults
    const compressionOptions = {
        ...defaultCompressionOptions,
        ...options
    };

    try {
        const compressedFile = await imageCompression(imageFile, compressionOptions);
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        console.error("Error during image compression:", error);
        // If compression fails, return the original file
        return imageFile;
    }
};