import Shop from '../models/Shop.js';

const getShopsForUser = async (req, res) => {
  try {
    // Extract userId from the request parameters or request body
    const userId = req.params.userId //|| req.user._id;

    // Fetch Shops that belong to the specific user
    const shops = await Shop.find({ userId }).populate('userId', 'name');

    // Send the shops in the response
    res.status(200).json(shops);
  } catch (error) {
    // Handle any errors
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'Server error. Unable to fetch shops.' });
  }
};


const getShops = async () => {
    // Fetch Shops from the database
    const shops = await Shop.find();
    return shops;
};

// Create a new shop
const createShop = async (data) => {
    const newShop = new Shop(data);
    return await newShop.save();
};

// Update a category
const updateShop = async (req, res) => {
  try {
    const updatedShop = await Shop.findByIdAndUpdate(req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedShop);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete a category
const deleteShop =  async (req, res) => {
  try {
    await Shop.findByIdAndDelete(req.params.id);
    res.status(200).json('Shop has been deleted...');
  } catch (err) {
    res.status(500).json(err);
  }
};

export { getShopsForUser, getShops,createShop,updateShop, deleteShop };