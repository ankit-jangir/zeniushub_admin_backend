const { emp_batch } = require("../models/");
const { CrudRepository } = require("./crud.repo");


class empBatchRepositories extends CrudRepository {
  constructor() {
    super(emp_batch);
  }


  async deleteAssignBatch(condition) {
    return await this.model.destroy({ where: { batch_id: condition } });
  }


}
module.exports = { empBatchRepositories }