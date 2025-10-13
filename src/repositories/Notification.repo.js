const {Notifications} = require("../models/index");
const { CrudRepository } = require("./crud.repo");

class NotificationRepositories extends CrudRepository {
  constructor() {
    super(Notifications);
  }
}

module.exports = { NotificationRepositories };
