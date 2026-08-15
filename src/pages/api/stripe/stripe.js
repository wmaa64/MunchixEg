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

    //const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const line_items = items.map((item) => ({
      price_data: {
        currency: "egp",
        product_data: {
          name: item.name.en || item.name, // Stripe only supports one language
          images: item.image? [item.image] : [],
        },
        // Stripe uses smallest currency unit (piasters)
        unit_amount: Math.round(item.price * 100), 
      },
      adjustable_quantity: {
        enabled: true,
        minimum: 1,
      },
      quantity: item.quantity,
    }));

    console.log("🧾 Stripe line_items:", JSON.stringify(line_items, null, 2));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      line_items,
      customer_email: email,
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&email=${email}&mobile=${mobile}`,
      cancel_url: `${req.headers.origin}/canceled`,
    });

    // ✅ Just return the session URL
    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
