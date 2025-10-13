const { CategoryName } = require("../models");    // models/index से import
const { CrudRepository } = require("./crud.repo");

class CategorynameRepository extends CrudRepository {
  constructor() {
    super(CategoryName);  
  }


} 
module.exports = new CategorynameRepository();
