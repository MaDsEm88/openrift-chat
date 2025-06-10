// packages/database/convex/setup_products.ts
import { mutation } from "./_generated/server";

// Run this mutation once to set up sample products
export const setupSampleProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return { message: "Products already exist", count: existingProducts.length };
    }

    // Create Autumn-compatible products matching your plan structure
    const products = [
      {
        id: "foundation_plan",
        name: "Foundation Plan",
        description: "Build your fitness foundation with intelligent AI guidance",
        price: 9.99,
        currency: "USD",
        interval: "month" as const,
        features: [
          "Complete onboarding assessment with long-term memory storage",
          "Sleep Time Compute - AI works in background to optimize your next workout",
          "Smart scheduling with automatic adjustments when life gets in the way",
          "Equipment photo analysis - Snap photos for instant workout alternatives",
          "Fridge scanning for basic meal suggestions from available ingredients",
          "Unlimited personalized workout programs",
          "Basic form guidance and injury prevention tips",
          "Progress tracking with weekly analytics",
          "Equipment adaptation for home or gym workouts",
          "3 detailed performance analysis reports per month",
          "Unlimited meal photo macro analysis with portion size detection",
          "15 grocery/fridge scans per month for meal planning",
          "Basic nutritional breakdown and meal suggestions",
          "5 personalized weekly meal plans",
          "Standard customer support"
        ],
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "performance_plan",
        name: "Performance Plan",
        description: "Unlock advanced AI coaching for serious fitness growth",
        price: 19.99,
        currency: "USD",
        interval: "month" as const,
        features: [
          "Everything from Foundation Plan",
          "Advanced Sleep Time Compute - Predictive program adjustments",
          "Smart grocery intelligence - Track meals you can make from purchases",
          "Proactive notifications before workouts with preparation tips",
          "Dynamic equipment alternatives when your usual machines are unavailable",
          "Advanced form correction with video tutorials and biomechanics feedback",
          "Real-time adaptation based on performance patterns",
          "Recovery optimization recommendations",
          "Unlimited detailed progress analytics with trend analysis",
          "Weekly performance coaching insights",
          "Unlimited grocery/fridge scanning with meal countdown tracking",
          "Personalized nutrition recommendations based on training goals",
          "Custom meal plans adapted to your household ingredients",
          "Restaurant menu guidance and macro estimation",
          "Priority customer support (24-hour response)"
        ],
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "champion_plan",
        name: "Champion Plan",
        description: "Elite AI coaching that anticipates your every fitness need",
        price: 29.99,
        currency: "USD",
        interval: "month" as const,
        features: [
          "Everything from Performance Plan",
          "Predictive Sleep Time Compute - AI anticipates needs before you do",
          "Advanced behavioral learning - Milo becomes your perfect training partner",
          "Intelligent meal prep forecasting - Never run out of healthy options",
          "Proactive lifestyle integration - Seamless adaptation to your changing schedule",
          "Advanced biomechanics analysis with AI-powered form optimization",
          "Plateau prevention with intelligent program periodization",
          "Competition preparation and peak performance protocols",
          "Real-time workout coaching with live form feedback",
          "Comprehensive health metrics integration with wearables",
          "AI training partner mode - conversational workout guidance",
          "AI meal prep coaching with shopping optimization",
          "Advanced metabolic adaptation tracking",
          "Personalized supplement recommendations",
          "Nutrition coaching conversations - ask Milo anything about your diet",
          "Integration with fitness goals for precision nutrition timing",
          "VIP customer support (same-day response)",
          "Early access to new AI features",
          "Monthly virtual coaching sessions",
          "Advanced progress reports and insights",
          "Priority feedback implementation"
        ],
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];

    const insertedIds: string[] = [];
    for (const product of products) {
      const id = await ctx.db.insert("products", product);
      insertedIds.push(id);
    }

    return {
      message: "Sample products created successfully",
      count: insertedIds.length,
      productIds: insertedIds
    };
  },
});
