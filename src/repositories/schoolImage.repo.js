const { CrudRepository } = require("./crud.repo");
const { SchoolImage } = require("../models/");

class schoolImageRepositories extends CrudRepository {
    constructor() {
        super(SchoolImage);
    }



}

module.exports = { schoolImageRepositories }
