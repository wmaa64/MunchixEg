import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { items, email, mobile } = req.body;

    if (!items || !email || !mobile) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ---------------------------------------
    // CALCULATE AMOUNT IN CENTS (Egp → piasters)
    // ---------------------------------------
    let amount = 0;

    items.forEach((item) => {
      const unitPrice = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      amount += unitPrice * qty;
    });

    // Convert EGP to piasters (Stripe uses smallest unit)
    const amountInPiasters = Math.round(amount * 100);

    console.log("💰 Calculated Amount (EGP):", amount);
    console.log("💰 Amount in piasters:", amountInPiasters);

    // ---------------------------------------
    // CREATE PAYMENT INTENT
    // ---------------------------------------
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPiasters,
      currency: "egp",
      metadata: {
        email,
        mobile,
        Order_items: JSON.stringify(items.map(item => item.displayName || item.name.en || item.name)),
      },
      receipt_email: email,
    });

    console.log("📧 PaymentIntent created:", paymentIntent.id);

    // ---------------------------------------
    // RETURN CLIENT SECRET TO MOBILE APP
    // ---------------------------------------
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    console.error("Stripe PaymentSheet error:", err);
    return res.status(500).json({ error: err.message });
  }
}
