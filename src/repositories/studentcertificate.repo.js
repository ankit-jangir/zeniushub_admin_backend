const { CrudRepository } = require("./crud.repo");  
const {StudentCertificate} = require("../models/index");

class StudentCertificateRepositories extends CrudRepository {
    constructor() {
        super(StudentCertificate);
    }



}

module.exports = { StudentCertificateRepositories }
