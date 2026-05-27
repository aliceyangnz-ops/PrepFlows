import { getUncachableStripeClient } from "./stripeClient.js";

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();

    console.log("Creating PrepFlows products in Stripe...\n");

    // ── Pro Plan ──────────────────────────────────────────────────────────────
    const existingPro = await stripe.products.search({
      query: "name:'PrepFlows Pro' AND active:'true'",
    });

    let proProduct;
    if (existingPro.data.length > 0) {
      console.log(`Pro Plan already exists: ${existingPro.data[0].id}`);
      proProduct = existingPro.data[0];
    } else {
      proProduct = await stripe.products.create({
        name: "PrepFlows Pro",
        description:
          "Full operational system for active kitchens. Unlimited functions, prep lists, run sheets, casual staff QR briefs, up to 30 staff members.",
        metadata: { plan_id: "pro" },
      });
      console.log(`Created Pro: ${proProduct.id}`);

      const proMonthly = await stripe.prices.create({
        product: proProduct.id,
        unit_amount: 4900,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { plan_id: "pro", interval: "month" },
      });
      console.log(`  Monthly price: $49.00/mo  (${proMonthly.id})`);

      const proYearly = await stripe.prices.create({
        product: proProduct.id,
        unit_amount: 47040,
        currency: "usd",
        recurring: { interval: "year" },
        metadata: { plan_id: "pro", interval: "year" },
      });
      console.log(`  Yearly price:  $470.40/yr  (${proYearly.id})  (save 20%)`);
    }

    // ── Team Plan ─────────────────────────────────────────────────────────────
    const existingTeam = await stripe.products.search({
      query: "name:'PrepFlows Team' AND active:'true'",
    });

    if (existingTeam.data.length > 0) {
      console.log(`\nTeam Plan already exists: ${existingTeam.data[0].id}`);
    } else {
      const teamProduct = await stripe.products.create({
        name: "PrepFlows Team",
        description:
          "Multi-event coordination and full staff management. Everything in Pro plus multiple simultaneous events, broadcast messages, unlimited staff, priority support.",
        metadata: { plan_id: "team" },
      });
      console.log(`\nCreated Team: ${teamProduct.id}`);

      const teamMonthly = await stripe.prices.create({
        product: teamProduct.id,
        unit_amount: 19900,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { plan_id: "team", interval: "month" },
      });
      console.log(`  Monthly price: $199.00/mo  (${teamMonthly.id})`);

      const teamYearly = await stripe.prices.create({
        product: teamProduct.id,
        unit_amount: 191040,
        currency: "usd",
        recurring: { interval: "year" },
        metadata: { plan_id: "team", interval: "year" },
      });
      console.log(
        `  Yearly price:  $1,910.40/yr  (${teamYearly.id})  (save 20%)`,
      );
    }

    console.log("\n✓ All products ready.");
    console.log("Webhooks will sync this data to your database automatically.");
  } catch (error: any) {
    console.error("Error creating products:", error.message);
    process.exit(1);
  }
}

createProducts();
