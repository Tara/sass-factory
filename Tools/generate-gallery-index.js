// npm install imagekit js-yaml dotenv
const fs = require('fs');
const yaml = require('js-yaml');
const ImageKit = require('imagekit');

// ImageKit configuration
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const OUTPUT_FILE = 'content/gallery/_index.md';
const GALLERY_FOLDER = '/gallery';

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Extract EXIF date if available, fallback to file creation date
function getPhotoDate(file) {
    // Check for EXIF data in customMetadata
    if (file.customMetadata) {
        const exifDate = file.customMetadata.DateTimeOriginal || 
                        file.customMetadata.CreateDate || 
                        file.customMetadata.DateCreated;
        if (exifDate) {
            return formatDate(exifDate);
        }
    }
    // Fallback to file creation date
    return formatDate(file.createdAt);
}

// Get caption from metadata or generate a default one
function generateCaption(file) {
    // Try to get caption from custom metadata
    if (file.customMetadata && file.customMetadata.caption) {
        return file.customMetadata.caption;
    }

    // If no custom caption, generate one with date
    // const date = getPhotoDate(file);
    // return `Sass Factory Performance - ${date}`;
}

async function generateGalleryIndex() {
    try {
        // Fetch all files from the gallery folder
        const response = await imagekit.listFiles({
            path: GALLERY_FOLDER,
            fileType: 'image',
            includeFolder: true
        });

        // Filter and map the images
        const images = response
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.name))
            .map(file => ({
                url: `gallery/${file.name}`,
                caption: generateCaption(file),
                date: getPhotoDate(file),
                metadata: {
                    takenAt: getPhotoDate(file),
                    uploadedAt: formatDate(file.createdAt),
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    dimensions: file.height && file.width ? 
                              `${file.width}x${file.height}` : 
                              'Unknown'
                }
            }))
            // Sort by date, newest first
            .sort((a, b) => new Date(b.metadata.takenAt) - new Date(a.metadata.takenAt));

        // Create the gallery content
        const galleryContent = {
            title: 'Performance Gallery',
            description: 'Capturing the magic of Sass Factory\'s performances across San Francisco',
            layout: 'gallery',
            images: images
        };

        // Convert to YAML front matter format
        const yamlContent = '---\n' + 
            yaml.dump(galleryContent, {
                sortKeys: false, // Preserve the order of our keys
                lineWidth: -1    // Prevent yaml from wrapping long lines
            }) +
            '---';

        // Ensure directory exists
        const dir = 'content/gallery';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write to _index.md
        fs.writeFileSync(OUTPUT_FILE, yamlContent);

        console.log(`Generated gallery index with ${images.length} images`);
        console.log('Sample image data:', images[0]);
        console.log('Output written to:', OUTPUT_FILE);

    } catch (error) {
        console.error('Error generating gallery index:', error.message);
        process.exit(1);
    }
}

// Check for required environment variables
const requiredEnvVars = [
    'IMAGEKIT_PUBLIC_KEY',
    'IMAGEKIT_PRIVATE_KEY',
    'IMAGEKIT_URL_ENDPOINT'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please set these environment variables before running the script.');
    process.exit(1);
}

// Run the script
generateGalleryIndex();