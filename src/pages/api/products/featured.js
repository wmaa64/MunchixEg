import connectDB from '../../../../lib/db';
import { getFeaturedProducts } from '../../../../controllers/productController';

export default async (req, res) => {
  await connectDB();

  try {
    const products = await getFeaturedProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error });
  }
};
