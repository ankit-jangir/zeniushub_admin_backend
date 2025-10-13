const {employeeSubject,Subject} = require("../models/");
const { CrudRepository } = require("./crud.repo");
const { Op,Sequelize  } = require("sequelize")

class employeeSubjectRepositories extends CrudRepository{
    constructor(){
        super(employeeSubject);
    }

    async findSubjectByEmployeeId(employeeId){
        return await this.model.findAll({
            where:{employeeId},
            include:[
                {
                    model:Subject,
                    attributes:['id','subject_name'],
                }
            ]
        })
    }

    async findUnassignedSubjects(employeeId) {
        return await Subject.findAll({
          where: {
            id: {
              [Op.notIn]: Sequelize.literal(`(
                SELECT "subjectId" FROM "employeeSubject"
                WHERE "employeeId" = ${employeeId}
              )`)
            }
          },
          attributes: ['id', 'subject_name']
        });
      }

}

module.exports = {employeeSubjectRepositories}