const { CrudRepository } = require("./crud.repo"); 
const {Salary} = require("../models/index");

class salaryRepositories extends CrudRepository {
    constructor() {
        super(Salary);
    }



}

module.exports = { salaryRepositories }
