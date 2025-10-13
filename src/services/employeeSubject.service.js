const {Subject} = require("../models/");
const {employeeSubjectRepositories} = require("../repositories/employeeSubject.repo");
const { employeeRepositories } = require("../repositories/employe.repo");
const customError = require("../utils/error.handler");
const employeeSubjectRepository = new employeeSubjectRepositories();
const employeeRepository = new employeeRepositories();
const employeeSubjectService = {
    addEmployeeSubjectService:async (data)=>{
        const {employeeId,subjectId} = data;

        //   Check if employee exists
          const employee = await employeeRepository.getDataById(employeeId);
          if (!employee) {
            throw new customError("Employee does not exist.", 404);
          }

        //check if record already exists
        const existing = await employeeSubjectRepository.findOne({employeeId,subjectId});

        if(existing){
            throw new customError("This subject is already assigned to the employee.");
        }

        const newRelation = await employeeSubjectRepository.create({employeeId,subjectId})

        return newRelation;
    },
    getEmployeeSubjectService:async(employeeId)=>{
        //   Check if employee exists
        const employee = await employeeRepository.getDataById(employeeId);
        if (!employee) {
          throw new customError("Employee does not exist.", 404);
        }
        const subjects = await employeeSubjectRepository.findSubjectByEmployeeId(employeeId)

        return subjects;
    },
    getEmployeeNonAddingSubjectService:async (employeeId)=>{
        //   Check if employee exists
        const employee = await employeeRepository.getDataById(employeeId);
        if (!employee) {
          throw new customError("Employee does not exist.", 404);
        }
        const unassignedSubjects = await employeeSubjectRepository.findUnassignedSubjects(employeeId);
        return unassignedSubjects;
    },
    delEmployeeSubj:async (employeeId)=>{
        //   Check if employee exists
        const employee = await employeeRepository.getDataById(employeeId);
        if (!employee) {
          throw new customError("Employee does not exist.", 404);
        }
        const unassignedSubjects = await employeeSubjectRepository.findUnassignedSubjects(employeeId);
        return unassignedSubjects;
    }
}


module.exports = employeeSubjectService;