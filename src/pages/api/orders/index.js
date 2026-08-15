import connectDB from '../../../../lib/db';
import { getOrders, getOrdersByDate, createOrder } from '../../../../controllers/orderController';

export default async (req, res) => {
  console.log("📩 Incoming API request:", req.method);

  await connectDB();

  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      const orders = date ? await getOrdersByDate(date) : await getOrders();

      res.status(200).json(orders);
    } catch (error) {
      console.error("❌ Error creating order:", error);
      res.status(500).json({ message: 'Failed to fetch orders', error });
    }
  }

  if (req.method === 'POST') {
    try {
      
      const order = await createOrder(req.body);
      console.log("✅ Order saved:", order._id);
      res.status(201).json({ success: true, order, });

    } catch (error) {
      res.status(500).json({ message: 'Failed to create order', error });
    }
  }
};
