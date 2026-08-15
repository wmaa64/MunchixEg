import connectDB from '../../../../lib/db';
import { updateUser, deleteUser } from '../../../../controllers/userController.js';

export default async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const updated = await updateUser(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteUser(id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
