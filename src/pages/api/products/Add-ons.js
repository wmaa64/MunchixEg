import connectDB from '../../../../lib/db';
import { getProductsBySubcategoryName } from '../../../../controllers/productController';

export default async (req, res) => {
  await connectDB();

  try {
    const products = await getProductsBySubcategoryName("Add-ons");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by subcategory', error });
  }
};
