const CategoryServices = require("../services/Category.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");

const categoryController = {
    addcategorycontroller: try_catch(async (req, res) => {
        const { name } = req.body;
        if (!name) {
            throw new customError("name fields are required", 400);
        }
        console.log(name)
        const data = await CategoryServices.addcategory({name})
        res.status(201).json({
            status: "success",
            message: "Batch created successfully",
            data: data
        });
    }),
    getallcategorycontroller: try_catch(async (req, res) => {
        const data = await CategoryServices.getcategoryservices()
        res.status(201).json({
            status: "success",
            message: "Batch created successfully",
            data: data
        });
    }),
    deletecategorycontroller: try_catch(async (req, res) => {
        console.log(req.body.id);
        const id = req.body.id
        
       
        const data = await CategoryServices.deletecategoryservices(id)

        console.log("^^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5",data);
        
        res.status(200).json({
            status: "success",
            message: "delete category ",
            data: data
        });
    }),
    updatecategorycontroller: try_catch(async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
    
        if (!id) {
            throw new customError("id field is required", 400);
        }
    
        if (!name) {
            throw new customError("name field is required", 400);
        }
    
        const data = await CategoryServices.updatecategoryservices(id, name);
    
        // Check if service returned an error message
        if (typeof data === "string") {
            return res.status(404).json({
                status: "error",
                message: data, // will be "This ID does not exist"
                data: null
            });
        }
    
        res.status(200).json({
            status: "success",
            message: data.message, // "Category updated successfully" or "Already up to date"
            data: data.data
        });
    })    
}
module.exports = categoryController