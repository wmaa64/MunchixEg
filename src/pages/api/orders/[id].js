import connectDB from '../../../../lib/db';
import { updateOrderStatus, updateOrder } from '../../../../controllers/orderController';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { orderStatus } = req.body;
      const updatedOrder = orderStatus ? await updateOrderStatus(id, orderStatus) : await updateOrder(id, req.body);
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      res.status(500).json({ message: 'Failed to update order status', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
