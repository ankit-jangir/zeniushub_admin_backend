const { where } = require("sequelize");
const customError = require("../utils/error.handler");
const { examCategoryRepositories } = require("../repositories/examCategory.repo");


const examCategoryRepository = new examCategoryRepositories();

const examCategoryService = {
    addExamCategory: async (data) => {
        let check = await examCategoryRepository.getOneData({
            categoryName: data.categoryName,
        });
        if (check) {
            throw new customError("Exam Category already exsits", 409);
        }



        await examCategoryRepository.create(data);
    },

    deleteExamCategory: async (id) => {
        return await examCategoryRepository.deleteData(id);
    },

     getAllExamCategory: async () => {
        return await examCategoryRepository.getData();
    },

};

module.exports = examCategoryService;
