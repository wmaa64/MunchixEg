import connectDB from '../../../../lib/db';
import { getProductById, updateProduct, deleteProduct } from '../../../../controllers/productController';

export default async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await getProductById(id);
      if (!product) return res.status(404).json({ message: 'Not found' });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product', error });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updated = await updateProduct(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Error updating product', error });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteProduct(id);
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product', error });
    }
  }
};
