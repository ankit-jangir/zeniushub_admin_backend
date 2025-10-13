const { where } = require("sequelize");
const { Admins } = require("../models/")
const { adminRepositories } = require("../repositories/admin.repo");
const customError = require("../utils/error.handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { ADMIN } = require("../config/server.config");
const client = require("../config/redis.config");

const saltRounds = 10;

dayjs.extend(utc);
dayjs.extend(timezone);

const adminRepository = new adminRepositories(Admins);


const adminService = {

    addAdmin: async (data) => {
        let check_email = await adminRepository.getOneData({ email: data.email });
        if (check_email) {

            throw new customError("Email already exsits", 409);

        }

        let check_m_number = await adminRepository.getOneData({ m_number: data.m_number });
        if (check_m_number) {

            throw new customError("Number already exsits", 409);

        }
        const hashPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashPassword
        await adminRepository.create(data);
    },

    getAllAdmin: async () => {
        return await adminRepository.getData();
    },

    getAdminById: async (id) => {
        return await adminRepository.getDataById(id);
    },

    viewProfile: async (id) => {
        const data = await adminRepository.getDataById(id);

        if (!data) {
            return { success: false, message: "Admin not found" };
        }

        // Convert Sequelize instance → plain object
        const plainData = data.get({ plain: true });

        // Remove sensitive fields
        delete plainData.password;
        delete plainData.socket_id;

        return plainData
    }
    ,

    updateAdmin: async (data, id) => {

        let check = await adminRepository.getOneData({ id: id.id });
        if (!check) {

            throw new customError("Admin not found", 404);

        }


        await adminRepository.update(data, id);
    },

    deleteAdmin: async (id) => {
        return await adminRepository.deleteData(id);
    },

    changePassword: async (data, id) => {

        let check = await adminRepository.getOneData({ id: id.id });
        if (!check) {

            throw new customError("Admin not found", 404);

        }
        const isMatch = await bcrypt.compare(data.current_password, check.password);

        if (!isMatch) {

            throw new customError("Current password incorrect", 401);
        }

        if (data.new_password !== data.confirm_password) {

            throw new customError("Confirm password does not match new password", 400);
        }
        const hashPassword = await bcrypt.hash(data.confirm_password, saltRounds);

        data.password = hashPassword;

        await adminRepository.update({ password: data.password }, id);
    },

    resetPassword: async (data, id) => {

        let check = await adminRepository.getOneData({ id: id.id });
        if (!check) {

            throw new customError("Admin not found", 404);

        }

        const hashPassword = await bcrypt.hash(data.new_password, saltRounds);

        data.password = hashPassword;
        await adminRepository.update({ password: data.password }, id);
    },

    otpSend: async (m_number) => {
        let check_m_number = await adminRepository.getOneData({ m_number: m_number });
        if (!check_m_number) {

            throw new customError("Number not found", 404);

        }



        return await adminRepository.otpSend(m_number);

    },

    otpResend: async (order_ID) => {

        return await adminRepository.otpResend(order_ID);

    },

    emailVerify: async (data) => {
        let check_m_number = await adminRepository.getOneData({ m_number: data.m_number });
        if (!check_m_number) {

            throw new customError("Number not found", 404);

        }

        const response = await adminRepository.otpVerify(data);

        if (response.isOTPVerified) {

            const emailVerifiedAt = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm");

            await adminRepository.update({ email_verified_at: emailVerifiedAt }, { id: check_m_number.id });
        }

        return response;
    },

    adminLogin: async (details) => {
        let check = await adminRepository.getOneData({ email: details.email });

        if (!check) {

            throw new customError("Invalid credentials", 404);

        }
        const isMatch = await bcrypt.compare(details.password, check.password);

        if (!isMatch) {
            throw new customError("Invalid credentials", 401);
        }
        const payload = {
            id: check.id,
            email: check.email
        };

        const token = jwt.sign(payload, ADMIN.ADMIN_PRIVATE_KEY);


        // Redis me token save karna (Sirf ek device allow karne ke liye)
        await client.set(`admin-${payload.id}`, token);

        return token;

    },

    adminLogout: async (id) => {

        let check = await adminRepository.getOneData({ id: id });

        if (!check) {

            throw new customError("Admin not found", 404);

        }


        await client.del(`admin-${id}`);

        const isLoggedIn = await client.exists(`admin-${id}`);
        if (isLoggedIn) {

            throw new customError("Admin is logged in", 400);
        } else {
            console.log("Admin is logged out");
        }


    },

    statusUpdate: async (data, id) => {
        let check = await adminRepository.getOneData({ id: id.id });
        if (!check) {

            throw new customError("Admin not found", 404);

        }

        if (check.status === data.status) {

            throw new customError(`The status is already ${data.status}`, 409);
        }
        await adminRepository.update(data, id);
    }

}

module.exports = adminService







