import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Category, Product, Variant, Merchant, Customer, Order } from '../models/index.js';
import { hashPassword } from '../utils/password.js';
import { generateOrderNumber } from '../utils/orderNumber.js';

config();

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Gadgets and electronic devices',
    isActive: true,
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Apparel and fashion items',
    isActive: true,
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home decor and garden supplies',
    isActive: true,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports equipment and accessories',
    isActive: true,
  },
];

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    categorySlug: 'electronics',
    basePrice: 9999,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', publicId: 'seed-headphones' }],
    optionTypes: [{ name: 'Color', values: ['Black', 'White', 'Blue'] }],
    variants: [
      { sku: 'WBH-BLK', optionValues: [{ name: 'Color', value: 'Black' }], price: 9999, inventory: 50 },
      { sku: 'WBH-WHT', optionValues: [{ name: 'Color', value: 'White' }], price: 9999, inventory: 35 },
      { sku: 'WBH-BLU', optionValues: [{ name: 'Color', value: 'Blue' }], price: 10999, inventory: 20 },
    ],
  },
  {
    name: 'Smart Watch Pro',
    slug: 'smart-watch-pro',
    description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.',
    categorySlug: 'electronics',
    basePrice: 29999,
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', publicId: 'seed-watch' }],
    optionTypes: [
      { name: 'Size', values: ['40mm', '44mm'] },
      { name: 'Color', values: ['Silver', 'Black'] },
    ],
    variants: [
      { sku: 'SWP-40-SLV', optionValues: [{ name: 'Size', value: '40mm' }, { name: 'Color', value: 'Silver' }], price: 29999, inventory: 25 },
      { sku: 'SWP-40-BLK', optionValues: [{ name: 'Size', value: '40mm' }, { name: 'Color', value: 'Black' }], price: 29999, inventory: 30 },
      { sku: 'SWP-44-SLV', optionValues: [{ name: 'Size', value: '44mm' }, { name: 'Color', value: 'Silver' }], price: 32999, inventory: 15 },
      { sku: 'SWP-44-BLK', optionValues: [{ name: 'Size', value: '44mm' }, { name: 'Color', value: 'Black' }], price: 32999, inventory: 20 },
    ],
  },
  {
    name: 'Classic Cotton T-Shirt',
    slug: 'classic-cotton-tshirt',
    description: '100% organic cotton t-shirt, comfortable and breathable.',
    categorySlug: 'clothing',
    basePrice: 2499,
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', publicId: 'seed-tshirt' }],
    optionTypes: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', values: ['White', 'Black', 'Navy'] },
    ],
    variants: [
      { sku: 'CCT-S-WHT', optionValues: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'White' }], price: 2499, inventory: 100 },
      { sku: 'CCT-M-WHT', optionValues: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'White' }], price: 2499, inventory: 150 },
      { sku: 'CCT-L-WHT', optionValues: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'White' }], price: 2499, inventory: 120 },
      { sku: 'CCT-XL-WHT', optionValues: [{ name: 'Size', value: 'XL' }, { name: 'Color', value: 'White' }], price: 2499, inventory: 80 },
      { sku: 'CCT-S-BLK', optionValues: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Black' }], price: 2499, inventory: 90 },
      { sku: 'CCT-M-BLK', optionValues: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Black' }], price: 2499, inventory: 140 },
      { sku: 'CCT-L-BLK', optionValues: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Black' }], price: 2499, inventory: 110 },
      { sku: 'CCT-XL-BLK', optionValues: [{ name: 'Size', value: 'XL' }, { name: 'Color', value: 'Black' }], price: 2499, inventory: 70 },
      { sku: 'CCT-M-NVY', optionValues: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Navy' }], price: 2499, inventory: 60 },
      { sku: 'CCT-L-NVY', optionValues: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Navy' }], price: 2499, inventory: 50 },
    ],
  },
  {
    name: 'Premium Yoga Mat',
    slug: 'premium-yoga-mat',
    description: 'Extra thick eco-friendly yoga mat with carrying strap.',
    categorySlug: 'sports',
    basePrice: 4999,
    images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', publicId: 'seed-yoga' }],
    optionTypes: [{ name: 'Color', values: ['Purple', 'Blue', 'Green'] }],
    variants: [
      { sku: 'PYM-PUR', optionValues: [{ name: 'Color', value: 'Purple' }], price: 4999, inventory: 40 },
      { sku: 'PYM-BLU', optionValues: [{ name: 'Color', value: 'Blue' }], price: 4999, inventory: 35 },
      { sku: 'PYM-GRN', optionValues: [{ name: 'Color', value: 'Green' }], price: 4999, inventory: 45 },
    ],
  },
  {
    name: 'Ceramic Plant Pot Set',
    slug: 'ceramic-plant-pot-set',
    description: 'Set of 3 modern ceramic plant pots with drainage holes.',
    categorySlug: 'home-garden',
    basePrice: 3499,
    images: [{ url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', publicId: 'seed-pots' }],
    optionTypes: [{ name: 'Style', values: ['Modern White', 'Terracotta', 'Speckled'] }],
    variants: [
      { sku: 'CPP-MWH', optionValues: [{ name: 'Style', value: 'Modern White' }], price: 3499, inventory: 30 },
      { sku: 'CPP-TER', optionValues: [{ name: 'Style', value: 'Terracotta' }], price: 3499, inventory: 25 },
      { sku: 'CPP-SPK', optionValues: [{ name: 'Style', value: 'Speckled' }], price: 3999, inventory: 20 },
    ],
  },
  {
    name: 'Portable Bluetooth Speaker',
    slug: 'portable-bluetooth-speaker',
    description: 'Waterproof portable speaker with 360° sound and 12-hour battery.',
    categorySlug: 'electronics',
    basePrice: 7999,
    images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', publicId: 'seed-speaker' }],
    optionTypes: [{ name: 'Color', values: ['Black', 'Red', 'Teal'] }],
    variants: [
      { sku: 'PBS-BLK', optionValues: [{ name: 'Color', value: 'Black' }], price: 7999, inventory: 45 },
      { sku: 'PBS-RED', optionValues: [{ name: 'Color', value: 'Red' }], price: 7999, inventory: 30 },
      { sku: 'PBS-TEA', optionValues: [{ name: 'Color', value: 'Teal' }], price: 7999, inventory: 25 },
    ],
  },
];

const customers = [
  {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0101',
    addresses: [
      {
        label: 'Home',
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1-555-0102',
    addresses: [
      {
        label: 'Home',
        line1: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
        isDefault: true,
      },
      {
        label: 'Work',
        line1: '789 Business Park',
        line2: 'Suite 200',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90002',
        country: 'US',
        isDefault: false,
      },
    ],
  },
  {
    email: 'bob.wilson@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    phone: '+1-555-0103',
    addresses: [
      {
        label: 'Home',
        line1: '321 Pine Road',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'US',
        isDefault: true,
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Order.deleteMany({});
    await Customer.deleteMany({});
    await Merchant.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Variant.deleteMany({});
    console.log('Cleared existing data');

    // Create a demo merchant
    const hashedPassword = await hashPassword('demo123');
    const merchant = await Merchant.create({
      email: 'demo@smartmerchant.com',
      passwordHash: hashedPassword,
      storeName: 'Demo Store',
      firstName: 'Demo',
      lastName: 'Merchant',
      isActive: true,
      isVerified: true,
    });
    console.log(`Created merchant: ${merchant.email}`);

    // Create categories with merchantId
    const categoriesWithMerchant = categories.map((cat) => ({
      ...cat,
      merchantId: merchant._id,
    }));
    const createdCategories = await Category.insertMany(categoriesWithMerchant);
    console.log(`Created ${createdCategories.length} categories`);

    // Create category lookup map
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // Create products and variants
    for (const productData of products) {
      const { variants: variantsData, categorySlug, ...productFields } = productData;

      const product = await Product.create({
        ...productFields,
        merchantId: merchant._id,
        categoryId: categoryMap[categorySlug],
        isActive: true,
        isFeatured: true,
      });

      const variantsToCreate = variantsData.map((v) => ({
        ...v,
        productId: product._id,
        isActive: true,
      }));

      await Variant.insertMany(variantsToCreate);
      console.log(`Created product: ${product.name} with ${variantsData.length} variants`);
    }

    // Create customers
    const customerPassword = await hashPassword('customer123');
    const customersWithPassword = customers.map((c) => ({
      ...c,
      passwordHash: customerPassword,
      isGuest: false,
    }));
    const createdCustomers = await Customer.insertMany(customersWithPassword);
    console.log(`Created ${createdCustomers.length} customers`);

    // Get all created variants for order items
    const allVariants = await Variant.find({}).populate('productId');

    // Create sample orders with various statuses
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const sampleOrders = [];

    for (let i = 0; i < createdCustomers.length; i++) {
      const customer = createdCustomers[i];
      const address = customer.addresses[0];

      // Each customer gets 2-3 orders
      const orderCount = 2 + (i % 2);

      for (let j = 0; j < orderCount; j++) {
        // Pick random variants for this order (1-3 items)
        const itemCount = 1 + Math.floor(Math.random() * 3);
        const orderItems = [];
        const usedVariants = new Set();

        for (let k = 0; k < itemCount; k++) {
          let variant;
          let attempts = 0;
          do {
            variant = allVariants[Math.floor(Math.random() * allVariants.length)];
            attempts++;
          } while (usedVariants.has(variant._id.toString()) && attempts < 10);

          if (!usedVariants.has(variant._id.toString())) {
            usedVariants.add(variant._id.toString());
            const quantity = 1 + Math.floor(Math.random() * 2);
            orderItems.push({
              variantId: variant._id,
              productId: variant.productId._id,
              productName: variant.productId.name,
              variantName: variant.optionValues.map((ov) => ov.value).join(' / '),
              sku: variant.sku,
              quantity,
              unitPrice: variant.price,
              totalPrice: variant.price * quantity,
            });
          }
        }

        const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const shippingCost = subtotal > 5000 ? 0 : 999;
        const taxAmount = Math.round(subtotal * 0.08);
        const total = subtotal + shippingCost + taxAmount;

        const status = orderStatuses[(i * orderCount + j) % orderStatuses.length];
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        const orderData = {
          orderNumber: generateOrderNumber(),
          merchantId: merchant._id,
          customerId: customer._id,
          customerEmail: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
          items: orderItems,
          shippingAddress: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          subtotal,
          shippingCost,
          taxAmount,
          total,
          status,
          paymentStatus: status === 'cancelled' ? 'refunded' : 'paid',
          paidAt: createdAt,
          createdAt,
          updatedAt: createdAt,
        };

        // Add status-specific timestamps
        if (status === 'shipped' || status === 'delivered') {
          orderData.shippedAt = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000);
          orderData.trackingNumber = `TRK${Date.now()}${i}${j}`;
          orderData.trackingCarrier = ['UPS', 'FedEx', 'USPS'][Math.floor(Math.random() * 3)];
        }
        if (status === 'delivered') {
          orderData.deliveredAt = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
        }
        if (status === 'cancelled') {
          orderData.cancelledAt = new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000);
        }

        sampleOrders.push(orderData);
      }
    }

    await Order.insertMany(sampleOrders);
    console.log(`Created ${sampleOrders.length} sample orders`);

    console.log('\nSeeding completed successfully!');
    console.log('\nDemo credentials:');
    console.log('  Merchant: demo@smartmerchant.com / demo123');
    console.log('  Customer: john.doe@example.com / customer123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
