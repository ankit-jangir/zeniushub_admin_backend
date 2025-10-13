const { Op, where, fn, col } = require("sequelize");
const { Leads, category, Employee, Session } = require("../models"); // Ensure correct model imports
const { CrudRepository } = require("./crud.repo");
const customError = require("../utils/error.handler");

class LeadsRepositories extends CrudRepository {
  constructor() {
    super(Leads);
  }

  async Getdatabyname(body) {
  if (!body.id) {
    throw new customError('session_id is required');
  }

  const whereConditions = {
    session_id: body.id,
  };

  if (body.assign_to !== undefined && body.assign_to !== '' && body.assign_to !== null) {
    whereConditions.assign_to = Number(body.assign_to);
  }

  const response = await Leads.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Employee,
        attributes:["first_name"],
        required: false,
      },
      {
        model: Session,
        attributes:["session_year","id"],
        required: false,
      },
    ],
    order: [['created_at', 'DESC']],
    limit: body.limit || 10,
    offset: body.offset || 0,
  });

  return response;
}


async statusResult(body){  
  console.log("useer data :  : : ", body.id)

  const whereConditions = {
    session_id: body.id,
  };

  // assign_to ko tabhi add karo jab wo empty string na ho aur valid number ho
  if (body.assign_to !== undefined && body.assign_to !== '' && body.assign_to !== null) {
    // convert to number to be safe
    whereConditions.assign_to = Number(body.assign_to);
  }

  if (body.status) {
    whereConditions.status = body.status;
  }

  const response = await Leads.findAll({
    attributes: [
      'status',
      [fn('COUNT', col('status')), 'count']
    ],
    where: whereConditions,
    group: ['status']
  });

  return response;
}













  async filterbystatus(status) {
    return await this.model.findAll({
      where: { status: { [Op.eq]: status } }
    });
  }















 









async  searchingleadsService(body, page = 1, limit = 10) {
  if (!body.id) throw new customError('session_id is required');

  // Base where condition: session_id is mandatory
  const whereConditions = { session_id: body.id };

  // Optional filters
  if (body.assign_to !== undefined && body.assign_to !== '' && body.assign_to !== null) {
    whereConditions.assign_to = Number(body.assign_to);
  }

  if (body.status) {
    whereConditions.status = body.status;
  }

  // Add name search condition if provided
  if (body.name && body.name.trim() !== '') {
    whereConditions.name = {
      [Op.like]: `%${body.name.trim()}%`
    };
  }

  // Total leads count for the session (without filters except session_id)
  const totalLeads = await Leads.count({
    where: { session_id: body.id }
  });

  // Pagination parameters
  const offset = (page - 1) * limit;

  // Get paginated leads with related Employee and Session info
  const dataResult = await Leads.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Employee,
        attributes: ["first_name"],
        required: false,
      },
      {
        model: Session,
        attributes: ["session_year", "id"],
        required: false,
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  // Get status counts grouped by status using the same filters (including name search)
  const statusCountsRaw = await Leads.findAll({
    attributes: [
      'status',
      [fn('COUNT', col('status')), 'count']
    ],
    where: whereConditions,  // apply all filters here including name
    group: ['status']
  });

  // Initialize status counts with 0
  const statusCounts = {
    Inconservation: 0,
    Droped: 0,
    Hot: 0,
    Converted: 0,
  };

  // Assign counts dynamically
  statusCountsRaw.forEach(row => {
    const status = row.get('status');
    const count = parseInt(row.get('count'), 10);
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status] = count;
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil(dataResult.count / limit);

  return {
    data: dataResult.rows,
    totalCount: dataResult.count,
    totalLeads,
    inconservationCount: statusCounts.Inconservation,
    droppedCount: statusCounts.Droped,
    hotCount: statusCounts.Hot,
    convertedCount: statusCounts.Converted,
    currentPage: page,
    totalPages,
    limit,
  };
}

  
}

module.exports = { LeadsRepositories };
