#!/usr/bin/env node

/**
 * Database User Verification Script
 * Checks if test users exist in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n===== DATABASE USER VERIFICATION =====\n');

  try {
    console.log('📊 Fetching all users from database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!\n');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. User ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Name: ${user.name}`);
        console.log(`      Phone: ${user.phone}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Status: ${user.status}`);
        console.log(`      Created: ${user.createdAt}\n`);
      });
    }

    // Also check for products
    console.log('\n📦 Checking products in database...\n');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true
      },
      take: 5
    });

    if (products.length === 0) {
      console.log('ℹ️  No products in database yet\n');
    } else {
      console.log(`✅ Found ${products.length} product(s):\n`);
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. Product: ${product.title}`);
        console.log(`      Product ID: ${product.id}`);
        console.log(`      User ID: ${product.userId}`);
        console.log(`      Created: ${product.createdAt}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
