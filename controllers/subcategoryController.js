import Subcategory from '../models/Subcategory.js';

const getSubCategories = async () => {
    // Fetch subcategories from the database
    const subcategories = await Subcategory.find({ active: true }).sort({ order: 1 });
    return subcategories;
};

// Create a new category
const createSubcategory = async (data) => {
    const newSubcategory = new Subcategory(data);
    return await newSubcategory.save();
};

// Update a category
const updateSubcategory = async (req, res) => {
  try {
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedSubcategory);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete a category
const deleteSubcategory =  async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.status(200).json('Subcategory has been deleted...');
  } catch (err) {
    res.status(500).json(err);
  }
};

export { getSubCategories,createSubcategory,updateSubcategory, deleteSubcategory };