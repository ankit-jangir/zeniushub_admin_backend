const { CrudRepository } = require("./crud.repo");
const { Session, Batches,Student_Enrollment } = require("../models/index");
const { Op, Sequelize } = require("sequelize");

class sessionRepositories extends CrudRepository {
  constructor() {
    super(Session);
  }

  async findwithRegex(filter, limit, page) {
    const offset = (page - 1) * limit;
    const whereCondition = {};

    if (filter.session_year) {
      whereCondition[Op.or] = [
        Sequelize.where(Sequelize.cast(Sequelize.col("session_year"), "TEXT"), {
          [Op.iRegexp]: `${filter.session_year}`,
        }),
        Sequelize.where(Sequelize.cast(Sequelize.col("id"), "TEXT"), {
          [Op.iRegexp]: `${filter.session_year}`,
        }),
      ];
    }

    const result = await Session.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      raw: true,
     order: [["id", "DESC"], ["session_year", "DESC"]],

    });
 
    const sessions = result.rows;

    if (sessions.length === 0) {
      return { totalCount: result.count, data: [] };
    }
    

    const batchCounts = await Student_Enrollment.findAll({
      attributes: [
        "session_id",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalBatches"],
      ],
      where: {
        session_id: { [Op.in]: sessions.map((s) => s.id) },
      },
      group: ["session_id"],
      raw: true,
    });

    const countMap = batchCounts.reduce((acc, row) => {
      acc[row.session_id] = parseInt(row.totalBatches, 10);
      return acc;
    }, {});

    const dataWithBatchCounts = sessions.map((sess) => ({
      ...sess,
      totalBatches: countMap[sess.id] || 0,
    }));

    return {
      totalCount: result.count,
      data: dataWithBatchCounts,
    };
  }

  async countSession() {
    return await Session.count();
  }
}

module.exports = { sessionRepositories };
