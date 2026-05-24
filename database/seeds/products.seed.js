"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSeedData = void 0;
const brands = ['Helfy', 'Nova', 'Arc', 'Pulse', 'Lumen', 'Forma'];
const productNames = [
    'Wireless Noise-Cancelling Headphones',
    'Smart Watch Pro',
    'Portable Bluetooth Speaker',
    '4K Action Camera',
    'Mechanical Keyboard RGB',
    'Minimalist Leather Jacket',
    'Merino Wool Sweater',
    'Classic White Sneakers',
    'Canvas Tote Bag',
    'Slim Fit Chino Pants',
    'Ceramic Pour-Over Set',
    'Scented Soy Candle Trio',
    'Linen Sheet Set',
    'Adjustable Desk Lamp',
    'Memory Foam Pillow',
    'Vitamin C Serum',
    'Hydrating Face Moisturizer',
    'Matte Lipstick Set',
    'Bamboo Hair Brush',
    'Aromatherapy Diffuser',
    'Carbon Fiber Yoga Mat',
    'Insulated Water Bottle',
    'Resistance Band Kit',
    'Trail Running Shoes',
    'Compact Gym Duffel',
    'The Art of Slow Living',
    'Modern Architecture Vol. 2',
    'Product Design Handbook',
    'Mindful Productivity Guide',
    'Creative Coding Patterns',
];
function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
const categoryIds = [
    'cat-electronics',
    'cat-electronics',
    'cat-electronics',
    'cat-electronics',
    'cat-electronics',
    'cat-fashion',
    'cat-fashion',
    'cat-fashion',
    'cat-fashion',
    'cat-fashion',
    'cat-home',
    'cat-home',
    'cat-home',
    'cat-home',
    'cat-home',
    'cat-beauty',
    'cat-beauty',
    'cat-beauty',
    'cat-beauty',
    'cat-beauty',
    'cat-sports',
    'cat-sports',
    'cat-sports',
    'cat-sports',
    'cat-sports',
    'cat-books',
    'cat-books',
    'cat-books',
    'cat-books',
    'cat-books',
];
exports.productSeedData = productNames.map((name, index) => {
    const slug = slugify(name);
    const price = 1999 + index * 750;
    const compareAtPrice = index % 3 === 0 ? price + 2000 : null;
    return {
        id: `prod-${String(index + 1).padStart(3, '0')}`,
        categoryId: categoryIds[index],
        name,
        slug,
        description: `${name} — crafted for quality and everyday premium comfort. Designed with attention to materials, durability, and modern aesthetics.`,
        price,
        compareAtPrice,
        brand: brands[index % brands.length],
        stock: 20 + (index % 15),
        imageUrl: `https://picsum.photos/seed/${slug}/800/800`,
    };
});
