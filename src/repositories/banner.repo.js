const { CrudRepository } = require("./crud.repo");
const { Banner } = require("../models/");

class bannerRepositories extends CrudRepository {
    constructor() {
        super(Banner);
    }



}

module.exports = { bannerRepositories }
