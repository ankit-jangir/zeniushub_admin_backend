const { SubjectRepositories } = require("../repositories/Subject.repo");
const { SubjectCoursesRepositories } = require("../repositories/Subject_courses.repo");
const customError = require("../utils/error.handler");
const { Subject, Sequelize } = require("../models/index");
const subCorses_services = require("./SubjectCourses.service");
const { Op } = require("sequelize");

const SubjectRepositorie = new SubjectRepositories();
const SubjectCoursesRepository = new SubjectCoursesRepositories();
const Subjectservice = {
  // addsubject: async (data) => {
  //   console.log("this is data for service file : ", data);
  //   const { subject_name, course_id } = data;
  //   let mySubject = await Subject.findOne({ where: { subject_name,status:"active" } });
  //   // console.log(mySubject,"******************************")
  //   if(mySubject){
  //     throw new customError("subject already Exist",400)
  //   }

  //   let subject= await SubjectRepositorie.create({ subject_name: data.subject_name });

  //   const subjectCourses = data.course_id.map((id)=>{
  //     return ({
  //       course_id:id,
  //       subject_id:subject.id
  //     })
  //   })

  //   return await SubjectCoursesRepository.bulkCreate(subjectCourses);
  // }
  // ,
  addsubject: async (data) => {
    console.log("this is data for service file : ", data);
    const { subject_name, course_id } = data;

    let mySubject = await Subject.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('subject_name')),
        subject_name.toLowerCase()
      )
    });

    if (mySubject) {
      throw new customError("subject already Exist", 400);
    }

    let subject = await SubjectRepositorie.create({ subject_name });

    const courseIds = Array.isArray(course_id) ? course_id : [course_id]; // ✅ ensures it's an array

    const subjectCourses = courseIds.map((id) => ({
      course_id: id,
      subject_id: subject.id
    }));

    return await SubjectCoursesRepository.bulkCreate(subjectCourses);
  }

  ,
  updatebysubjectnameservice: async (id, subject_name, course_id) => {
    let data = await SubjectRepositorie.getDataById(id)
    // let check=await SubjectRepositorie.findOne({subject_name:subject_name});
    // if(check){
    //   throw new customError("already subject exists with this name",401)
    // }
    if (course_id.length>0) {


      const existingMappings = await SubjectCoursesRepository.findAll(
        {
          subject_id: data.id,
          course_id: {
            [Op.in]: course_id
          }
        }
      );
      console.log(existingMappings);
      if (existingMappings.length > 0) {
        const existingCourseIds = existingMappings.map(m => m.course_id);
        throw new customError(`Subject is already linked with course IDs: ${existingCourseIds.join(', ')}`);
      }

      // Safe to insert new (subject_id, course_id) pairs
      const newMappings = course_id.map(cid => ({
        subject_id: data.id,
        course_id: cid
      }));

     await SubjectCoursesRepository.bulkCreate(newMappings);
      // return


    }
    if(subject_name){

      const userdata = await SubjectRepositorie.update(
        { subject_name: subject_name },
        { id: id }
      );
    }
    
    // console.log("this is userdata:", userdata);
    return ;
  },

  deletesubjectservices: async ( id ) => {
  if (!id) throw new customError("Subject ID is required");
  console.log("Service received ID:", id); // <--- debug log

  const data = await SubjectRepositorie.update({ status: "inactive" }, { id: id });

  const deleteforsyubcourse = await SubjectCoursesRepository.deleteDatasub({subject_id:id});

  return {
    data,
    deleteforsyubcourse,
  };
}
,

getallsubjectservice: async (search, page, limit) => {
  return await SubjectRepositorie.searchapi(search, page, limit);
}
,
  searchbysubjectnameservices: async () => {
    return await SubjectRepositorie.findAll();
  },
};

module.exports = { Subjectservice };
