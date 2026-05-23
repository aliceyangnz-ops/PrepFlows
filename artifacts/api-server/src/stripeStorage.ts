import { db, profilesTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';

export class StripeStorage {
  async getProfile(id: string) {
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));
    return profile ?? null;
  }

  async upsertProfile(id: string) {
    try {
      await db
        .insert(profilesTable)
        .values({ id })
        .onConflictDoNothing();
    } catch {
      // row already exists — no action needed
    }
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));
    return profile ?? null;
  }

  async updateProfileStripeInfo(
    userId: string,
    info: { stripeCustomerId?: string; stripeSubscriptionId?: string },
  ) {
    const updateData: Partial<typeof profilesTable.$inferInsert> = {};
    if (info.stripeCustomerId !== undefined) updateData.stripeCustomerId = info.stripeCustomerId;
    if (info.stripeSubscriptionId !== undefined) updateData.stripeSubscriptionId = info.stripeSubscriptionId;

    const [profile] = await db
      .update(profilesTable)
      .set(updateData)
      .where(eq(profilesTable.id, userId))
      .returning();
    return profile ?? null;
  }

  async listProductsWithPrices(active = true) {
    const result = await db.execute(sql`
      WITH paginated_products AS (
        SELECT id, name, description, metadata, active
        FROM stripe.products
        WHERE active = ${active}
        ORDER BY name
      )
      SELECT
        p.id          AS product_id,
        p.name        AS product_name,
        p.description AS product_description,
        p.active      AS product_active,
        p.metadata    AS product_metadata,
        pr.id         AS price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active     AS price_active
      FROM paginated_products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      ORDER BY p.name, pr.unit_amount
    `);
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`,
    );
    return result.rows[0] ?? null;
  }

  async getActiveSubscriptionByCustomerId(customerId: string) {
    const result = await db.execute(
      sql`
        SELECT * FROM stripe.subscriptions
        WHERE customer = ${customerId}
          AND status IN ('active', 'trialing')
        ORDER BY created DESC
        LIMIT 1
      `,
    );
    return result.rows[0] ?? null;
  }
}

export const stripeStorage = new StripeStorage();
