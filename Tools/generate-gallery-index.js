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

// Configuration
const OUTPUT_FILE = 'content/gallery/_index.md';
const GALLERY_FOLDER = '/gallery'; // The folder path in ImageKit

// Generate caption from filename
function generateCaption(filename) {
    return filename
        .replace(/\.(jpg|jpeg|png|gif)$/i, '')
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function generateGalleryIndex() {
    try {
        // Fetch all files from the gallery folder
        const response = await imagekit.listFiles({
            path: GALLERY_FOLDER,
            fileType: 'image'  // Only fetch images
        });

        // Filter and map the images
        const images = response
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.name))
            .map(file => ({
                url: `gallery/${file.name}`,
                caption: generateCaption(file.name),
                // You can add more metadata if needed:
                // uploadedAt: file.createdAt,
                // size: file.size,
                // dimensions: `${file.height}x${file.width}`
            }));

        // Create the gallery content
        const galleryContent = {
            title: 'Performance Gallery',
            description: 'Capturing the magic of Sass Factory\'s performances across San Francisco',
            layout: 'gallery',
            images: images
        };

        // Convert to YAML front matter format
        const yamlContent = '---\n' + 
            yaml.dump(galleryContent) +
            '---';

        // Ensure directory exists
        const dir = 'content/gallery';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write to _index.md
        fs.writeFileSync(OUTPUT_FILE, yamlContent);

        console.log(`Generated gallery index with ${images.length} images`);
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