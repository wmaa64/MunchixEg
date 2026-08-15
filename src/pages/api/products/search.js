import connectDB from '../../../../lib/db';
import { getProductsByQuery } from '../../../../controllers/productController';

export default async (req, res) => {
  await connectDB();

  try {
    
    const { q } = req.query;

    if (!q || q.trim() === "") {
        return res.status(200).json([]);
    }

    const products = await getProductsByQuery(q);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching searched products', error });
  }
};

