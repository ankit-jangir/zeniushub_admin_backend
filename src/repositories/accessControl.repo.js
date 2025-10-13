const {Department} = require("../models/");
const { CrudRepository } = require("./crud.repo");

class accessRepositories extends CrudRepository {
    constructor() {
        super(Department);
    }
}

module.exports={accessRepositories}