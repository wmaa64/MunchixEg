// controllers/basketController.js
import mongoose from 'mongoose';
import Basket from '../models/Basket.js';


// Add item to basket
const addToBasket = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    let basket = await Basket.findOne({ userId });

    if (basket) {
      const itemIndex = basket.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        basket.items[itemIndex].quantity += quantity;
      } else {
        basket.items.push({ productId, quantity });
      }
    } else {
      basket = new Basket({ userId, items: [{ productId, quantity }] });
    }

    await basket.save();
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to basket', error });
  }
};

// Get user basket
const getBasket = async (req, res) => {
  const { userId } = req.params;
 
  try {
    const basket = await Basket.findOne({ userId }).populate('items.productId')  ;
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching basket', error });
  }
};

// Remove item from basket
const removeFromBasket = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const basket = await Basket.findOne({ userId });
    if (!basket) {
      return res.status(404).json({ message: 'Basket not found' });
    }

    basket.items = basket.items.filter(item => item.productId.toString() !== productId);
    await basket.save();
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from basket', error });
  }
};


// Delete a User Basket
const deleteUserBasket =  async (req, res) => {
  try {
    const { userId } = req.params;
    const basket = await Basket.findOneAndDelete({userId});
    
    if (!basket) {
      return res.status(404).json({ message: 'Basket not found' });
    }

    res.status(200).json({ message: 'Basket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting basket', error });
  }
};

export { addToBasket, getBasket, removeFromBasket, deleteUserBasket };