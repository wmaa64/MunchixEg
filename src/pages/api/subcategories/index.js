import connectDB from '../../../../lib/db';
import { getSubCategories, createSubcategory } from '../../../../controllers/subcategoryController';

export default async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const subcategories = await getSubCategories();
      res.status(200).json(subcategories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch subcategories', error });
    }
  }

  if (req.method === 'POST') {
    try {
      const subcategory = await createSubcategory(req.body);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create subcategory', error });
    }
  }
};
