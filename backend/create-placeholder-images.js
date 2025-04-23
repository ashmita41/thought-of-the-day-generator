const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Ensure directories exist
const GENERATED_IMAGES_DIR = path.resolve(__dirname, '../generated-images');
const THOUGHT_IMAGES_DIR = path.join(GENERATED_IMAGES_DIR, 'thoughts');
const WORD_IMAGES_DIR = path.join(GENERATED_IMAGES_DIR, 'words');

// Create directories if they don't exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

ensureDirectoryExists(GENERATED_IMAGES_DIR);
ensureDirectoryExists(THOUGHT_IMAGES_DIR);
ensureDirectoryExists(WORD_IMAGES_DIR);

// Create placeholder image function
function createPlaceholderImage(message = 'Image not available') {
  const canvas = createCanvas(800, 500);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, 800, 500);
  
  // Border
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 760, 460);
  
  // Main text
  ctx.fillStyle = '#555555';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Placeholder Image', 400, 200);
  
  // Secondary text
  ctx.font = '24px Arial';
  ctx.fillText(message, 400, 250);
  
  // Additional decorative elements
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.lineTo(500, 300);
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  return canvas;
}

// Save the placeholder images
function saveImage(canvas, filepath) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`Image saved to: ${filepath}`);
}

// Create and save thought placeholder
const thoughtCanvas = createPlaceholderImage('Thought of the Day');
saveImage(thoughtCanvas, path.join(THOUGHT_IMAGES_DIR, 'placeholder.png'));

// Create and save word placeholder
const wordCanvas = createPlaceholderImage('Word of the Day');
saveImage(wordCanvas, path.join(WORD_IMAGES_DIR, 'placeholder.png'));

console.log('Placeholder images created successfully!'); 