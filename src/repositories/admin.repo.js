const { CrudRepository } = require("./crud.repo");
const { Admin } = require("../models/index");
const { ADMIN } = require("../config/server.config");
const UserDetail = require("otpless-node-js-auth-sdk");

class adminRepositories extends CrudRepository {
    constructor() {
        super(Admin);
    }

    async otpSend(m_number) {

        return await UserDetail.sendOTP(`+91${m_number}`, null, "SMS", null, null, 60, "6", ADMIN.ADMIN_CLIENT_ID, ADMIN.ADMIN_CLIENT_SECRET);

    }

    async otpResend(order_ID) {

        return await UserDetail.resendOTP(order_ID,  ADMIN.ADMIN_CLIENT_ID, ADMIN.ADMIN_CLIENT_SECRET);

    }

    async otpVerify(data) {

        return await UserDetail.verifyOTP(null, `+91${data.m_number}`, data.order_ID, data.otp, ADMIN.ADMIN_CLIENT_ID, ADMIN.ADMIN_CLIENT_SECRET);


    }

}

module.exports = { adminRepositories }
