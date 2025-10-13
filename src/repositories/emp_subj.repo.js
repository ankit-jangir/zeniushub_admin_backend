const { emp_subj } = require("../models");
const { CrudRepository } = require("./crud.repo");


class empSubjRepositories extends CrudRepository {
  constructor() {
    super(emp_subj);
  }

  async deleteAssignSubject(condition) {
    return await this.model.destroy({ where: { subject_id: condition } });
  }
}
module.exports = { empSubjRepositories }