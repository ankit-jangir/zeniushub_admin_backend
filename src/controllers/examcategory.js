const { logger } = require("sequelize/lib/utils/logger");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const { examCategorySchema } = require("../validators/examCategory.validation");
const examCategoryService = require("../services/examCategory.service");


const examCategory = {

    addExamCategory: try_catch(
        async (req, res) => {

            const result = examCategorySchema.pick({ categoryName: true }).safeParse(req.body);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            await examCategoryService.addExamCategory(req.body);

            return res.status(201).send({ status: "001", message: "Exam Category created successfully" });
        }
    ),


    deleteExamCategory: try_catch(
        async (req, res) => {

            const result = examCategorySchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const deleted = await examCategoryService.deleteExamCategory(req.params.id);

            if (!deleted) {


                throw new customError("Exam Category not found", 404);
            }
            return res.status(200).send({ status: "001", message: "Exam category deleted successfully" });
        }
    ),

    getAllExamCategory: try_catch(
        async (req, res) => {
            const examCategories = await examCategoryService.getAllExamCategory();

            return res.status(200).send({ status: "001", examCategories });
        }
    ),

}
module.exports = { examCategory }


