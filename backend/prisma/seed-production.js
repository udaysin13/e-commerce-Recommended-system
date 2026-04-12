// Prisma Seed Data - Sample Data for Testing & Development
// Run with: npx prisma db seed

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("🌱 Starting database seed...\n");

  try {
    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log("👥 Creating users...");

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: "john@example.com",
          password: "$2b$10$hashed_password_1",
          name: "John Doe",
          phone: "555-0001",
          address: "123 Main St, City, State 12345",
          preferences: JSON.stringify({
            categories: ["ELECTRONICS", "BOOKS"],
            priceRange: { min: 20, max: 500 },
            language: "en"
          }),
          totalSpent: 1250.50,
          totalOrders: 5
        }
      }),
      prisma.user.create({
        data: {
          email: "jane@example.com",
          password: "$2b$10$hashed_password_2",
          name: "Jane Smith",
          phone: "555-0002",
          address: "456 Oak Ave, City, State 12346",
          preferences: JSON.stringify({
            categories: ["CLOTHING", "BEAUTY"],
            priceRange: { min: 10, max: 200 },
            language: "en"
          }),
          totalSpent: 850.00,
          totalOrders: 3
        }
      }),
      prisma.user.create({
        data: {
          email: "bob@example.com",
          password: "$2b$10$hashed_password_3",
          name: "Bob Wilson",
          phone: "555-0003",
          address: "789 Pine Rd, City, State 12347",
          preferences: JSON.stringify({
            categories: ["SPORTS", "ELECTRONICS"],
            priceRange: { min: 15, max: 1000 },
            language: "en"
          }),
          totalSpent: 2100.75,
          totalOrders: 8
        }
      })
    ]);

    console.log(`✅ Created ${users.length} users\n`);

    // ============================================
    // 2. CREATE PRODUCTS
    // ============================================
    console.log("📦 Creating products...");

    const products = await Promise.all([
      // Electronics
      prisma.product.create({
        data: {
          name: "Wireless Headphones",
          description:
            "High-quality wireless headphones with noise cancellation and 30-hour battery life",
          category: "ELECTRONICS",
          price: 199.99,
          originalPrice: 249.99,
          discount: 20,
          imageUrl: "https://example.com/headphones.jpg",
          images: [
            "https://example.com/headphones-1.jpg",
            "https://example.com/headphones-2.jpg"
          ],
          rating: 4.5,
          reviewCount: 234,
          viewCount: 1205,
          purchaseCount: 87,
          keywords: ["headphones", "wireless", "audio", "bluetooth"],
          inStock: true,
          stockQuantity: 150,
          trending: true,
          featured: true
        }
      }),
      prisma.product.create({
        data: {
          name: "USB-C Cable",
          description: "Fast charging USB-C cable, 2 meters long, durable nylon braiding",
          category: "ELECTRONICS",
          price: 14.99,
          originalPrice: 19.99,
          discount: 25,
          imageUrl: "https://example.com/usb-c.jpg",
          images: ["https://example.com/usb-c-1.jpg"],
          rating: 4.2,
          reviewCount: 450,
          viewCount: 3450,
          purchaseCount: 523,
          keywords: ["cable", "usb-c", "charging"],
          inStock: true,
          stockQuantity: 500,
          trending: false,
          featured: true
        }
      }),
      prisma.product.create({
        data: {
          name: "Laptop Stand",
          description: "Adjustable aluminum laptop stand for better posture and cooling",
          category: "ELECTRONICS",
          price: 49.99,
          originalPrice: 59.99,
          discount: 17,
          imageUrl: "https://example.com/laptop-stand.jpg",
          images: ["https://example.com/laptop-stand-1.jpg"],
          rating: 4.7,
          reviewCount: 156,
          viewCount: 875,
          purchaseCount: 92,
          keywords: ["laptop", "stand", "desk", "accessories"],
          inStock: true,
          stockQuantity: 200,
          trending: true,
          featured: false
        }
      }),

      // Books
      prisma.product.create({
        data: {
          name: "The Art of Programming",
          description: "Comprehensive guide to programming best practices and design patterns",
          category: "BOOKS",
          price: 39.99,
          originalPrice: 39.99,
          discount: 0,
          imageUrl: "https://example.com/programming-book.jpg",
          images: ["https://example.com/programming-book-1.jpg"],
          rating: 4.8,
          reviewCount: 89,
          viewCount: 567,
          purchaseCount: 124,
          keywords: ["programming", "design", "patterns", "education"],
          inStock: true,
          stockQuantity: 100,
          trending: false,
          featured: false
        }
      }),
      prisma.product.create({
        data: {
          name: "Business Strategy 101",
          description: "Learn strategic thinking and business development from industry experts",
          category: "BOOKS",
          price: 34.99,
          originalPrice: 44.99,
          discount: 22,
          imageUrl: "https://example.com/business-book.jpg",
          images: ["https://example.com/business-book-1.jpg"],
          rating: 4.3,
          reviewCount: 145,
          viewCount: 678,
          purchaseCount: 98,
          keywords: ["business", "strategy", "management", "education"],
          inStock: true,
          stockQuantity: 150,
          trending: false,
          featured: false
        }
      }),

      // Clothing
      prisma.product.create({
        data: {
          name: "Comfortable Running Shoes",
          description: "Lightweight running shoes with superior comfort and support",
          category: "CLOTHING",
          price: 89.99,
          originalPrice: 119.99,
          discount: 25,
          imageUrl: "https://example.com/running-shoes.jpg",
          images: ["https://example.com/running-shoes-1.jpg", "https://example.com/running-shoes-2.jpg"],
          rating: 4.6,
          reviewCount: 312,
          viewCount: 1823,
          purchaseCount: 267,
          keywords: ["shoes", "running", "sports", "comfort"],
          inStock: true,
          stockQuantity: 300,
          trending: true,
          featured: true
        }
      }),

      // Sports
      prisma.product.create({
        data: {
          name: "Yoga Mat Premium",
          description: "Non-slip yoga mat with carrying strap, 6mm thickness",
          category: "SPORTS",
          price: 29.99,
          originalPrice: 39.99,
          discount: 25,
          imageUrl: "https://example.com/yoga-mat.jpg",
          images: ["https://example.com/yoga-mat-1.jpg"],
          rating: 4.5,
          reviewCount: 234,
          viewCount: 1245,
          purchaseCount: 156,
          keywords: ["yoga", "fitness", "mat", "exercise"],
          inStock: true,
          stockQuantity: 250,
          trending: false,
          featured: false
        }
      }),

      // Beauty
      prisma.product.create({
        data: {
          name: "Natural Skin Care Set",
          description: "Complete skincare routine with 5 organic products, all natural ingredients",
          category: "BEAUTY",
          price: 79.99,
          originalPrice: 99.99,
          discount: 20,
          imageUrl: "https://example.com/skincare-set.jpg",
          images: ["https://example.com/skincare-set-1.jpg"],
          rating: 4.7,
          reviewCount: 456,
          viewCount: 2134,
          purchaseCount: 345,
          keywords: ["skincare", "natural", "beauty", "organic"],
          inStock: true,
          stockQuantity: 120,
          trending: true,
          featured: true
        }
      })
    ]);

    console.log(`✅ Created ${products.length} products\n`);

    // ============================================
    // 3. CREATE INTERACTIONS (CORE FOR RECOMMENDATIONS)
    // ============================================
    console.log("👁️  Creating interactions...");

    const interactions = [];

    // John's interactions
    interactions.push(
      {
        userId: users[0].id,
        productId: products[0].id, // Wireless Headphones
        type: "VIEW"
      },
      {
        userId: users[0].id,
        productId: products[0].id, // Wireless Headphones
        type: "CLICK"
      },
      {
        userId: users[0].id,
        productId: products[0].id, // Wireless Headphones
        type: "PURCHASE"
      },
      {
        userId: users[0].id,
        productId: products[1].id, // USB-C Cable
        type: "VIEW"
      },
      {
        userId: users[0].id,
        productId: products[1].id, // USB-C Cable
        type: "PURCHASE"
      },
      {
        userId: users[0].id,
        productId: products[3].id, // The Art of Programming
        type: "VIEW"
      },
      {
        userId: users[0].id,
        productId: products[3].id, // The Art of Programming
        type: "PURCHASE"
      }
    );

    // Jane's interactions
    interactions.push(
      {
        userId: users[1].id,
        productId: products[5].id, // Comfortable Running Shoes
        type: "VIEW"
      },
      {
        userId: users[1].id,
        productId: products[5].id, // Comfortable Running Shoes
        type: "CLICK"
      },
      {
        userId: users[1].id,
        productId: products[5].id, // Comfortable Running Shoes
        type: "PURCHASE"
      },
      {
        userId: users[1].id,
        productId: products[7].id, // Natural Skin Care Set
        type: "VIEW"
      },
      {
        userId: users[1].id,
        productId: products[7].id, // Natural Skin Care Set
        type: "PURCHASE"
      },
      {
        userId: users[1].id,
        productId: products[6].id, // Yoga Mat Premium
        type: "VIEW"
      }
    );

    // Bob's interactions
    interactions.push(
      {
        userId: users[2].id,
        productId: products[0].id, // Wireless Headphones
        type: "VIEW"
      },
      {
        userId: users[2].id,
        productId: products[0].id, // Wireless Headphones
        type: "PURCHASE"
      },
      {
        userId: users[2].id,
        productId: products[2].id, // Laptop Stand
        type: "VIEW"
      },
      {
        userId: users[2].id,
        productId: products[2].id, // Laptop Stand
        type: "CLICK"
      },
      {
        userId: users[2].id,
        productId: products[2].id, // Laptop Stand
        type: "PURCHASE"
      },
      {
        userId: users[2].id,
        productId: products[1].id, // USB-C Cable
        type: "VIEW"
      },
      {
        userId: users[2].id,
        productId: products[1].id, // USB-C Cable
        type: "PURCHASE"
      },
      {
        userId: users[2].id,
        productId: products[6].id, // Yoga Mat Premium
        type: "CLICK"
      }
    );

    // Create interactions with dynamic weights
    const createdInteractions = await Promise.all(
      interactions.map((interaction, index) => {
        const weights = {
          VIEW: 1.0,
          CLICK: 2.0,
          PURCHASE: 5.0,
          WISHLIST: 3.0,
          REVIEW: 4.0,
          COMPARE: 2.0
        };

        return prisma.interaction.create({
          data: {
            ...interaction,
            weight: weights[interaction.type] || 1.0,
            metadata: JSON.stringify({
              deviceType: "desktop",
              source: "product_page",
              referrer: "search"
            })
          }
        });
      })
    );

    console.log(`✅ Created ${createdInteractions.length} interactions\n`);

    // ============================================
    // 4. CREATE VIEW HISTORY
    // ============================================
    console.log("📺 Creating view history...");

    const viewHistory = await Promise.all([
      prisma.viewHistory.create({
        data: {
          userId: users[0].id,
          productId: products[0].id,
          timeSpent: 120, // 2 minutes
          source: "search"
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[0].id,
          productId: products[1].id,
          timeSpent: 45,
          source: "recommendation"
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[1].id,
          productId: products[5].id,
          timeSpent: 180,
          source: "search"
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[1].id,
          productId: products[7].id,
          timeSpent: 90,
          source: "homepage"
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[2].id,
          productId: products[0].id,
          timeSpent: 150,
          source: "direct"
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[2].id,
          productId: products[2].id,
          timeSpent: 210,
          source: "search"
        }
      })
    ]);

    console.log(`✅ Created ${viewHistory.length} view history records\n`);

    // ============================================
    // 5. CREATE CARTS
    // ============================================
    console.log("🛒 Creating carts...");

    const carts = await Promise.all([
      prisma.cart.create({
        data: {
          userId: users[0].id,
          totalPrice: 0,
          itemCount: 0
        }
      }),
      prisma.cart.create({
        data: {
          userId: users[1].id,
          totalPrice: 0,
          itemCount: 0
        }
      }),
      prisma.cart.create({
        data: {
          userId: users[2].id,
          totalPrice: 0,
          itemCount: 0
        }
      })
    ]);

    console.log(`✅ Created ${carts.length} carts\n`);

    // ============================================
    // 6. CREATE ORDERS
    // ============================================
    console.log("📋 Creating orders...");

    const orders = await Promise.all([
      prisma.order.create({
        data: {
          userId: users[0].id,
          status: "DELIVERED",
          subtotal: 199.99,
          tax: 15.99,
          shippingCost: 5.0,
          discount: 0,
          total: 220.98,
          paymentMethod: "credit_card",
          shippingAddress: "123 Main St, City, State 12345",
          trackingNumber: "TRACK123456",
          deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          items: {
            create: [
              {
                productId: products[0].id,
                quantity: 1,
                price: 199.99,
                subtotal: 199.99
              }
            ]
          }
        },
        include: { items: true }
      }),
      prisma.order.create({
        data: {
          userId: users[1].id,
          status: "DELIVERED",
          subtotal: 89.99,
          tax: 7.2,
          shippingCost: 5.0,
          discount: 10,
          total: 92.19,
          paymentMethod: "paypal",
          shippingAddress: "456 Oak Ave, City, State 12346",
          trackingNumber: "TRACK123457",
          deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          items: {
            create: [
              {
                productId: products[5].id,
                quantity: 1,
                price: 89.99,
                subtotal: 89.99
              }
            ]
          }
        },
        include: { items: true }
      }),
      prisma.order.create({
        data: {
          userId: users[2].id,
          status: "SHIPPED",
          subtotal: 264.98,
          tax: 21.19,
          shippingCost: 10.0,
          discount: 0,
          total: 296.17,
          paymentMethod: "credit_card",
          shippingAddress: "789 Pine Rd, City, State 12347",
          trackingNumber: "TRACK123458",
          items: {
            create: [
              {
                productId: products[0].id,
                quantity: 1,
                price: 199.99,
                subtotal: 199.99
              },
              {
                productId: products[1].id,
                quantity: 1,
                price: 14.99,
                subtotal: 14.99
              },
              {
                productId: products[2].id,
                quantity: 1,
                price: 49.99,
                subtotal: 49.99
              }
            ]
          }
        },
        include: { items: true }
      })
    ]);

    console.log(`✅ Created ${orders.length} orders\n`);

    // ============================================
    // 7. STATISTICS
    // ============================================
    console.log("\n📊 DATABASE SUMMARY:");
    console.log("=".repeat(50));

    const stats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      interactions: await prisma.interaction.count(),
      viewHistory: await prisma.viewHistory.count(),
      orders: await prisma.order.count(),
      orderItems: await prisma.orderItem.count(),
      carts: await prisma.cart.count(),
      cartItems: await prisma.cartItem.count()
    };

    Object.entries(stats).forEach(([key, value]) => {
      console.log(`${key.padEnd(20)}: ${value}`);
    });

    console.log("=".repeat(50));
    console.log("\n✅ Seed completed successfully!");
  } catch (error) {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedDatabase();
