const { CategoryRepositories } = require("../repositories/Category.repo");

const CategoryRepositorie = new CategoryRepositories();

const CategoryServices = {
    addcategory: async (data) => {
        console.log("i am data : ", data)
        return await CategoryRepositorie.create(data)
    },
    getcategoryservices: async () => {
        return await CategoryRepositorie.getData()
    },
    deletecategoryservices: async (id) => {
        // const newdata = await CategoryRepositorie.getOneData(id);
        // if (!newdata) {
        //     throw new Error("Does not exist categoryid  in category model: ");
        // }
        return await CategoryRepositorie.deleteData(id)
    },
    // updatecategoryservices: async (id,updatedata) => {
    //     const data = await CategoryRepositorie.update({name:updatedata },{id:id})
    //     return await data;
    // }
    updatecategoryservices: async (id, updatedata) => {
        // Step 1: Check if category exists
        const existingCategory = await CategoryRepositorie.getDataById(id);
        if (!existingCategory) {
            return "This ID does not exist"
          }
      
        // Step 2: Check if data is already updated
        if (existingCategory.name === updatedata) {
          return {
            message: "Category already up to date",
            data: existingCategory
          };
        }
      
        // Step 3: Proceed with update
        await CategoryRepositorie.update({ name: updatedata }, { id });
      
        // Step 4: Get updated data and return
        const updated = await CategoryRepositorie.getDataById(id);
        return {
          message: "Category updated successfully",
          data: updated
        };
      }
      
      
}
module.exports = CategoryServices;