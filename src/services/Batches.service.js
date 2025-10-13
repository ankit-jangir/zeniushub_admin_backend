const moment = require("moment");
const { Op, where } = require("sequelize");
const {
  Batches,
  Session,
  Course,
  Sequelize,
  Subject,
  SubjectCourse,
  Student,
} = require("../models/");
const { batchesRepositories } = require("../repositories/Batches.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { studentRepositories } = require("../repositories/student.repo");
const {mystuaccessRepositories} = require('../repositories/studentEmrollment.repo')
const customError = require("../utils/error.handler");

const batchesRepositorie = new batchesRepositories();
const CoursesRepositorie = new CoursesRepositories();
const studentRepositorie = new studentRepositories();
const mystuaccessRepositorie = new mystuaccessRepositories();

const batchesServies = {
  addbatchservies: async (data) => {
    // ✅ Check if course exists
    let check = await CoursesRepositorie.getOneData({ id: data.course_id });
    if (!check) {
      throw new customError("Course not found", 404);
    }

    // ✅ Check if batch name already exists (case-insensitive)
    let checkBatchName = await batchesRepositorie.getOneData({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("BatchesName")),
        data.BatchesName.toLowerCase()
      ),
    });

    if (checkBatchName) {
      throw new customError("Batch name already exists");
    }

    return await batchesRepositorie.create(data);
  },

  // getallbatchesservices: async () => {
  //     const data = await batchesRepositorie.getData();
  //     const newdata = data.map(i => i.course_id);

  //       console.log(newdata);
  //       const newa = await CoursesRepositorie.getData({
  //         where: {
  //           id: {
  //             [Op.in]: newdata
  //           }
  //         },
  //         attributes: ['id', 'course_name'] // sirf yeh fields chahiye
  //       });
  //       newa.forEach(course => {
  //         console.log(course.course_name);
  //       });

  //     return data
  // }

  getallbatchesservices: async (batchName,course_id, page, limit) => {
    const data = await batchesRepositorie.searchapidta(batchName,course_id, page, limit);
     return data;
  },

  deletebatchservices: async (id) => {
    // console.log("id", id)
    const data = await batchesRepositorie.getDataById(id);
    if (!data) {
      throw new customErrors("batch not found");
    }
    return await batchesRepositorie.deleteData(id);
  },
  // batchupdate: async (batchid) => {
  //     const { id, batchName, startDate, endDate, batchFees,course } = batchid;

  //     const getallbatch = await batchesRepositorie.getDataById(id);

  //     const batch_Name = getallbatch.dataValues.BatchesName;
  //     const start_Date = getallbatch.dataValues.StartDate;
  //     const end_Date = getallbatch.dataValues.EndDate;
  //     const batch_Fees = getallbatch.dataValues.BatchFees;
  //     const course_id = getallbatch.dataValues.course_id;
  //     const data = await CoursesRepositorie.getOneData({id:course_id})
  //     console.log("^^^^^^^^^^",data.dataValues.course_name);
  //     const coursename = data.dataValues.course_name

  //     console.log(batch_Name, start_Date, end_Date, batch_Fees);

  //     const updatedData = {
  //         BatchesName: batchName,
  //         StartDate: startDate,
  //         EndDate: endDate,
  //         BatchFees: batchFees,
  //         course_name:course
  //     };
  //     const lastfinaldata = await batchesRepositorie.update(updatedData, { id });  // The `where` clause tells Sequelize which record to update based on `id`

  //     return { lastfinaldata };
  // },
  batchupdate: async (batchid) => {
    const { id, batchName, batchFees, course } = batchid;

    // 1. Get the existing batch
    const existingBatch = await batchesRepositorie.getDataById(id);
    if (!existingBatch) {
      throw new customError("Batch not found");
    }

    const {
      BatchesName,
      BatchFees,
      course_id: courseId,
    } = existingBatch.dataValues;

    // 2. If `course` is a new course name, update it in the course table
    if (course && isNaN(course)) {
      await CoursesRepositorie.update(
        { course_name: course },
        { id: courseId }
      );
    }

    // 3. Prepare updated batch data (🔥 removed StartDate, EndDate)
    const updatedData = {
      BatchesName: batchName || BatchesName,
      BatchFees: batchFees || BatchFees,
      course_id: courseId,
    };

    // 4. Update the batch
    const lastfinaldata = await batchesRepositorie.update(updatedData, { id });

    return { lastfinaldata };
  },


  timeupdate: async (data) => {
    const { id, start_time, end_time } = data;
    const getallbatch = await batchesRepositorie.getDataById(id);

    if (!getallbatch) {
      throw new customError("batch not found", 401);
    }
    // const StartTime = getallbatch.dataValues.StartTime;
    // const EndTime = getallbatch.dataValues.EndTime;
    console.log("data  ", data);

    // return
    const updatedData = {
      StartTime: start_time,
      EndTime: end_time,
    };
    const lastfinaldata = await batchesRepositorie.update(updatedData, {
      id: id,
    }); // The `where` clause tells Sequelize which record to update based on `id`
    const updatedBatche = await batchesRepositorie.getDataById(id);
    return {
      lastfinaldata,
      updatedBatche,
    };
  },
  searchingbatch: async ({ BatchesName, status, page, limit }) => {
    return await batchesRepositorie.searchapi({
      BatchesName,
      status,
      page,
      limit,
    });
  },
  getBatchByCourseIdService: async (courseId) => {
    const batches = await Batches.findAll({
      where: { course_id: courseId },
      include: [
        // {
        //   model: Session,
        //   attributes: ["session_year"], // Assuming Batches has 'BatchesName' field
        // },
        {
          model: Course,
          attributes: ["course_price", "course_duration"],
        },
      ],
    });
    if (!batches) {
      throw new customError("No batches found for this course ID");
    }
    return { batches };
  },
  coursestudent: async (id) => {
    return await batchesRepositorie.accessdata(id);
  },
  // updatebatchfildes: async (data) => {
  //   const { id, batchname, batchfees, StartDate, EndDate } = data;

  //   const updatedData = {};

  //   if (batchname) updatedData.BatchesName = batchname;
  //   if (batchfees) updatedData.BatchFees = batchfees;
  //   if (StartDate) updatedData.StartDate = StartDate;
  //   if (EndDate) updatedData.EndDate = EndDate;

  //   if (!id) throw new Error("ID is required to update batch");

  //   const result = await batchesRepositorie.update(
  //     updatedData,              // fields to update
  //     { id: id }                // condition object (to be wrapped in `where:` by your method)
  //   );

  //   // return result;

  //   // 3. Prepare updated batch data
  //   const updatedData = {
  //     BatchesName: batchName || BatchesName,
  //     StartDate: startDate || StartDate,
  //     EndDate: endDate || EndDate,
  //     BatchFees: batchFees || BatchFees,
  //     course_id: courseId,
  //   };

  //   // 4. Update the batch
  //   const lastfinaldata = await batchesRepositorie.update(updatedData, { id });

  //   return { lastfinaldata };
  // },

  timeupdate: async (data) => {
    const { id, start_time, end_time } = data;
    const getallbatch = await batchesRepositorie.getDataById(id);

    if (!getallbatch) {
      throw new customError("batch not found", 401);
    }
    // const StartTime = getallbatch.dataValues.StartTime;
    // const EndTime = getallbatch.dataValues.EndTime;

    const updatedData = {
      StartTime: start_time,
      EndTime: end_time,
    };
    const lastfinaldata = await batchesRepositorie.update(updatedData, {
      id: id,
    }); // The `where` clause tells Sequelize which record to update based on `id`
    const updatedBatche = await batchesRepositorie.getDataById(id);
    return {
      lastfinaldata,
      updatedBatche,
    };
  },
  updateStatus: async (batchId) => {
    const batch = await batchesRepositorie.getDataById(batchId);

    if (!batch) {
      const error = new customError("Batch not found");
      error.statusCode = 404;
      throw error;
    }

       const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); 
const day = String(today.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;

const getStudent = await mystuaccessRepositorie.findAll({batch_id:batchId});

for(const enrollment of getStudent){
  if(enrollment.student_id && formattedDate<=enrollment.ending_course_date){
  throw new customError('The student is in this batch and the batch duration is til. so you cannot inactive it '+enrollment.ending_course_date,400);
}
}

    const newStatus = batch.status === "active" ? "inactive" : "active";
    console.log(batchId, "************************************************* batchid")

    // Update status
    await batchesRepositorie.update({ status: newStatus }, { id: batchId });

    // Return final updated data as {id, status}
    return { id: batchId, status: newStatus };
  },

  getBatchByCourseIdService: async (courseId) => {

    const batches = await Batches.findAll({
      where: { course_id: courseId, status: "active" },
       include: [
          {
            model: Course,
            attributes: ["course_name"],
          },
        ],
    });



    const subjectCount = await SubjectCourse.count({
      where: { course_id: courseId },
    });




    return { batches, subjectCount };
  },


  coursestudent: async (batchId, sessionId) => {
    return await batchesRepositorie.accessdata(batchId, sessionId);
  },



  updatebatchfildes: async (data) => {
    const { id, batchname, batchfees } = data;

    if (!id) throw new customError("ID is required to update batch");

    const updatedData = {};

    if (batchname) updatedData.BatchesName = batchname;
    if (batchfees) updatedData.BatchFees = batchfees;

    const result = await batchesRepositorie.update(
      updatedData, // fields to update
      { id }       // condition
    );

    return result;
  },

};
module.exports = batchesServies;
