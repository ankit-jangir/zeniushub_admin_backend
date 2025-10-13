const { where } = require("sequelize");
const customError = require("../utils/error.handler");
const { Session } = require("../models/");
const { sessionRepositories } = require("../repositories/session.repo");
const { Op } = require("sequelize");

const sessionRepository = new sessionRepositories(Session);

const sessionService = {
  addSession: async (data) => {
    let check = await sessionRepository.getOneData({
      session_year: data.session_year,
    });
    if (check) {
      throw new customError("Session already exsits", 409);
    }

    const currentYear = new Date().getFullYear();
    const sessionYear = parseInt(data.session_year);

    if (sessionYear > currentYear + 1) {
      throw new customError("Session year cannot be more than next year", 400);
    }


    await sessionRepository.create(data);
  },
  findwithRegex: async (filter, limit = 18, page = 1) => {


    return await sessionRepository.findwithRegex(filter, limit, page);
  },

  getSessions: async () => {
    return await sessionRepository.getData();
  },

  getSessionById: async (id) => {
    return await sessionRepository.getDataById(id);
  },

  updateSession: async (data, id) => {
    let check = await sessionRepository.getOneData({ id: id.id });
    if (!check) {
      throw new customError("Session not found", 404);
    }
    let check_session = await sessionRepository.getOneData({
      session_year: data.session_year,
    });
    if (check_session) {
      throw new customError("Session already exsits", 409);
    }
    await sessionRepository.update(data, id);
  },

  deleteSession: async (id) => {
    return await sessionRepository.deleteData(id);
  },

  defaultSession: async (data, id) => {
    let check = await sessionRepository.getOneData({ id: id.id });
    if (!check) {
      throw new customError("Session not found", 404);
    }

    if (check.is_default) {
      throw new customError("The session is already set to default.", 409);
    }

    await sessionRepository.update({ is_default: false }, { is_default: true });
    await sessionRepository.update(data, id);
  },

  countSession: async () => {
    return await sessionRepository.countSession();
  },
};

module.exports = sessionService;
