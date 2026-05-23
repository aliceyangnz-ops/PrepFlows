import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { stripeStorage } from '../stripeStorage.js';
import { stripeService } from '../stripeService.js';
import type { Request, Response } from 'express';

const router = Router();

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
    const { priceId } = req.body as { priceId: string };
    if (!priceId) {
      res.status(400).json({ error: 'priceId is required' });
      return;
    }

    const customerId = await stripeService.getOrCreateCustomer(req.user!.id, req.user!.email);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/?subscribed=true`,
      `${baseUrl}/subscribe`,
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
