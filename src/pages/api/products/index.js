import connectDB from '../../../../lib/db';
import { getProducts, getSubcategoryProducts, createProduct } from '../../../../controllers/productController';

export default async (req, res) => {
  await connectDB();

  const { subcategoryId } = req.query;

  if (req.method === 'GET') {
    try {
      const products = (subcategoryId) ? await getSubcategoryProducts(subcategoryId) :  await getProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products', error });
    }
  }

  if (req.method === 'POST') {
    try {
      const product = await createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create product', error });
    }
  }
};
