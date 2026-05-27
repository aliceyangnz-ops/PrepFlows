import { getUncachableStripeClient } from "./stripeClient.js";
import { stripeStorage } from "./stripeStorage.js";

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.customers.create({ email, metadata: { userId } });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const stripe = await getUncachableStripeClient();
    return stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: { trial_period_days: 30 },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getOrCreateCustomer(userId: string, email: string) {
    let profile = await stripeStorage.getProfile(userId);
    if (!profile) {
      profile = await stripeStorage.upsertProfile(userId);
    }

    if (profile?.stripeCustomerId) {
      return profile.stripeCustomerId;
    }

    const customer = await this.createCustomer(email, userId);
    await stripeStorage.updateProfileStripeInfo(userId, {
      stripeCustomerId: customer.id,
    });
    return customer.id;
  }
}

export const stripeService = new StripeService();
