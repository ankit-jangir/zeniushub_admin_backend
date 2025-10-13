const { CrudRepository } = require("./crud.repo");
const { PopularCourses } = require("../models/index");

class popularCourseRepo extends CrudRepository {
  constructor() {
    super(PopularCourses);
  }
}

module.exports = { popularCourseRepo };
