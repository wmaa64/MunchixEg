import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ message: "Missing session_id" });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching Stripe session:", error);
    res.status(500).json({ message: "Error fetching Stripe session" });
  }
}
