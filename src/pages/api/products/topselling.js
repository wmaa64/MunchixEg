import connectDB from '../../../../lib/db';
import { getTopSellingProducts } from '../../../../controllers/productController';

export default async (req, res) => {
  await connectDB();

  try {
    const products = await getTopSellingProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top selling products', error });
  }
};
