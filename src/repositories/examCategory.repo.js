const { CrudRepository } = require("./crud.repo");
const { ExamCategory } = require("../models/index");

class examCategoryRepositories extends CrudRepository {
    constructor() {
        super(ExamCategory);
    }

 

}

module.exports = { examCategoryRepositories }
