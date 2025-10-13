const customError = require("../utils/error.handler");

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    console.log(data,"*******************************data");
    return await this.model.create(data);
  }

  async getData() {
    return await this.model.findAll();
  }
  async findOne(query) { 

    return await this.model.findOne({ where: query }); 
  }
  async findOneOrderWies(query = {}, options = {}) {
  return await this.model.findOne({
    where: query,
    ...options,
  });
}
  async findAndCountAll(query) {
    return await this.model.findAndCountAll(query);
  }
  async getOneData(dataToFind) {
    return await this.model.findOne({ where: dataToFind });
  }

  async getDataById(id) {
    return await this.model.findByPk(id);
  }
  async findOneWithmodel(query) {
  if (!query.where) {
    return await this.model.findOne({ where: query });
  }
  return await this.model.findOne(query);
}

  
  async update(data, dataToUpdate) {
    return await this.model.update(data, { where: dataToUpdate });
    //format should be {id:id}, nd fro upadte {name:"xyz"}
  }
  async findAll(query) {
    return await this.model.findAll({ where: query ,raw: true,});
  }

  async insertMany(data) {
    return await this.model.bulkCreate(data);
  }

  // async findAll(query) {
  //   return await this.model.findAll({ where: query });
  // }

  async deleteData(condition) {
    return await this.model.destroy({ where:{id:  condition} });
  }
  async deleteDatasub(condition) {
    return await this.model.destroy({ where: condition });
  }
  // New method to search based on given criteria
  async searchData(criteria, limit, offset) {
    return await this.model.findAndCountAll({
      where: criteria,
      limit, // Number of records per page
      offset, // Skip records for pagination
    });
  }
  async getAllWithCondition(dataToFind,attribute) {
    return await this.model.findAll({ where: dataToFind,attributes: attribute,raw:true });
  }
  async aggregate(pipeline) {
    if (!this.model.aggregate) {
      throw new customError("Aggregation not supported on this model.");
    }
    return await this.model.aggregate(pipeline);
  }
  async count(data){
    return await this.model.count({ where:data})
  }
  
  async bulkCreate(data){
return await this.model.bulkCreate(data)
  }
}

module.exports = { CrudRepository };
