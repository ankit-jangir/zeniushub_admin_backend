const { CrudRepository } = require("./crud.repo");
const { PaymentReceipt } = require("../models/index");

class PaymentReceiptRepositories extends CrudRepository {
    constructor() {
        super(PaymentReceipt);
    }

   

}

module.exports = { PaymentReceiptRepositories }
