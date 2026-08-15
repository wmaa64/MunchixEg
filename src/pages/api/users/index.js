import connectDB from '../../../../lib/db';
import { getUsers, registerUser, loginUser } from '../../../../controllers/userController';

export default async (req, res) =>{
  await connectDB();

  if (req.method === 'GET') {
    try {
      const users = await getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await registerUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const user = await loginUser(req.body);
      res.status(200).json(user);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}
