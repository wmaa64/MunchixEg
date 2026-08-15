import {  createPaymobOrder, } from "../../../../controllers/paymobController";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { orderId,  email, mobile, } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required.",
      });
    }

    const result = await createPaymobOrder({ orderId, email, mobile, });

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error("❌ Paymob API error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||  "Payment initialization failed.",
    });
  }
}