const { CrudRepository } = require("./crud.repo");
const { Subject, sequelize, Course } = require("../models/index");
const { Op } = require('sequelize');

class SubjectRepositories extends CrudRepository {
  constructor() {
    super(Subject);
  }

async searchapi(search, page, limit) {
  // Set defaults for pagination
  page = !isNaN(page) && page > 0 ? parseInt(page, 10) : 1;
  limit = !isNaN(limit) && limit > 0 ? parseInt(limit, 10) : 10;

  const whereCondition = { status: "active" };

  // Add filtering condition
  if (search && typeof search === "string" && search.trim() !== "") {
    whereCondition.subject_name = {
      [Op.iLike]: `%${search.trim()}%`,
    };
  }

  // First, get the total count
  const totalCount = await Subject.count({ where: whereCondition });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  // Adjust the page if it's more than total pages
  page = page > totalPages ? totalPages : page;
  page = page < 1 ? 1 : page; // prevent going below page 1
  const offset = (page - 1) * limit;

  // Fetch paginated records
  const { rows } = await Subject.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Course,
        attributes: ['id', 'course_name'],
        through: { attributes: [] },
      },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true, // to avoid duplication count due to joins
  });

  return {
    data: rows,
    meta: {
      totalRecords: totalCount,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
    },
  };
}





}

module.exports = { SubjectRepositories };
