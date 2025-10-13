const { CrudRepository } = require("./crud.repo");
const { StudentCertificate } = require("../models/index");

class certificateRepositories extends CrudRepository {
    constructor() {
        super(StudentCertificate);
    }

   

}

module.exports = { certificateRepositories }
