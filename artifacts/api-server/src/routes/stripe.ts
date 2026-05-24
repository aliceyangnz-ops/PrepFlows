import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { stripeStorage } from '../stripeStorage.js';
import { stripeService } from '../stripeService.js';
import { getStripePublishableKey } from '../stripeClient.js';
import type { Request, Response } from 'express';

const router = Router();

// Public — returns the publishable key so the browser can initialise Stripe.js
router.get('/stripe/config', async (_req: Request, res: Response) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (err: any) {
    res.status(503).json({ error: err.message });
  }
});

router.get('/stripe/products', async (_req: Request, res: Response) => {
  try {
    const rows = await stripeStorage.listProductsWithPrices();

    const productsMap = new Map<string, any>();
    for (const row of rows as any[]) {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          metadata: row.product_metadata ?? {},
          prices: [],
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id).prices.push({
          id: row.price_id,
          unit_amount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
        });
      }
    }

    res.json({ data: Array.from(productsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stripe/subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await stripeStorage.getProfile(req.user!.id);
    if (!profile?.stripeCustomerId) {
      res.json({ subscription: null });
      return;
    }

    const subscription = await stripeStorage.getActiveSubscriptionByCustomerId(profile.stripeCustomerId);
    res.json({ subscription: subscription ?? null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    // Accept either a raw Stripe price ID or a plan alias + billing interval
    const { priceId, plan, billing } = req.body as { priceId?: string; plan?: string; billing?: string };
    const rawId = priceId ?? plan;
    if (!rawId) {
      res.status(400).json({ error: 'priceId or plan is required' });
      return;
    }

    // If caller sent a plan alias ("pro", "team") instead of a real Stripe price ID,
    // resolve it to the correct price using the synced stripe.products / stripe.prices tables.
    let resolvedPriceId = rawId;
    if (!rawId.startsWith('price_')) {
      const interval = billing === 'annual' || billing === 'yearly' ? 'year' : 'month';
      const rows = await stripeStorage.listProductsWithPrices();
      const match = (rows as any[]).find(
        (r) =>
          r.product_metadata?.plan_id === rawId &&
          r.recurring?.interval === interval,
      );
      if (!match) {
        res.status(400).json({ error: `No ${interval}ly price found for plan "${rawId}". Make sure Stripe products are seeded.` });
        return;
      }
      resolvedPriceId = match.price_id as string;
    }

    const customerId = await stripeService.getOrCreateCustomer(req.user!.id, req.user!.email);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const session = await stripeService.createCheckoutSession(
      customerId,
      resolvedPriceId,
      `${baseUrl}/?subscribed=true`,
      `${baseUrl}/prepflows-website/pricing`,
    );

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/portal', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await stripeStorage.getProfile(req.user!.id);
    if (!profile?.stripeCustomerId) {
      res.status(404).json({ error: 'No billing account found' });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const session = await stripeService.createCustomerPortalSession(
      profile.stripeCustomerId,
      `${baseUrl}/subscribe`,
    );

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
