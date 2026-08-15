import connectDB from '../../../../lib/db';
import { getShops, createShop } from '../../../../controllers/shopController';

export default async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const shops = await getShops();
      res.status(200).json(shops);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch shops', error });
    }
  }

  if (req.method === 'POST') {
    try {
      const shop = await createShop(req.body);
      res.status(201).json(shop);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create shop', error });
    }
  }
};
