import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';

const getCategoryWithSubCategory = async (req, res) => {
  try {
     // Fetch all categories
     const categories = await Category.find();

     // Fetch all subcategories
     const subcategories = await Subcategory.find();
 
     // Format the response
     const data = categories.map(category => {
       const subcats = subcategories.filter(sub => sub.categoryId.toString() === category._id.toString());
       return {
         ...category.toObject(),
         //subcategories: subcats,
         subcategories: subcats.map((sub) => ({
          _id: sub._id,
          name: sub.name,
          description: sub.description
        })),
       };
     });
    
    
    // Send the categories in the response
    res.status(200).json(data);
  } catch (error) {
    // Handle any errors
    console.error('Error fetching categories with their subcategories:', error);
    res.status(500).json({ message: 'Server error. Unable to fetch catherogies with their subcategories.' });
  }
};

 
// Create a new category
const createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete a category
const deleteCategory =  async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json('Category has been deleted...');
  } catch (err) {
    res.status(500).json(err);
  }
};

export { getCategoryWithSubCategory, createCategory,updateCategory, deleteCategory };