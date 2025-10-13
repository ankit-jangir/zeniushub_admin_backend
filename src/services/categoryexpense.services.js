const categorynameRepository = require("../repositories/categoryexpense.repo");

const categoryexpense = {
  // ✅ Create Category
  createcategory: async (data) => {
    if (!data.categoryName || data.categoryName.trim() === "") {
      throw { status: 400, message: "categoryName is required" };
    }
    const userData = await categorynameRepository.create({
      categoryName: data.categoryName.trim(),
    });
    return userData;
  },

  // ✅ Get All Categories
  getAllCategories: async () => {
    return await categorynameRepository.findAll(); // CrudRepository me already findAll hota hai
  },

  // ✅ Get Single Category By ID
  getCategoryById: async (id) => {
    const category = await categorynameRepository.getDataById(id);
    if (!category) {
      throw { status: 404, message: "Category not found" };
    }
    return category;
  },

  // ✅ Update Category
  updateCategory: async (id, data) => {
    if (!data.categoryName || data.categoryName.trim() === "") {
      throw { status: 400, message: "categoryName is required" };
    }

    // update karna (existing update method use kar ke)
    const [updatedCount] = await categorynameRepository.update(
      { categoryName: data.categoryName.trim() }, // data to update
      { id: id } // condition
    );

    if (updatedCount === 0) {
      throw { status: 404, message: "Category not found" };
    }

    // actual updated object get karna
    const updatedCategory = await categorynameRepository.getDataById(id);
    return updatedCategory; // object return ho jayega
  },
  // ✅ Delete Category
  deleteCategory: async (id) => {
  // ensure id is a number
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) throw { status: 400, message: "Invalid ID" };

  const deleted = await categorynameRepository.deleteData(numericId);

  console.log('====================================');
  console.log(deleted);
  console.log('====================================');

  if (!deleted) throw { status: 404, message: "Category not found" };
  return { message: "Category deleted successfully" };
},
};

module.exports = categoryexpense;
