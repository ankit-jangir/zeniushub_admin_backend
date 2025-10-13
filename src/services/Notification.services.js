const { batchesRepositories } = require("../repositories/Batches.repo");
const { NotificationRepositories } = require("../repositories/Notification.repo");
const { studentRepositories } = require("../repositories/student.repo");
const customError = require("../utils/error.handler");
const { sendNotification } = require("../utils/FireBase.Utils");

const NotificationRepositorie = new NotificationRepositories();
const batchesRepositori = new batchesRepositories();
const studentRepositorie = new studentRepositories()

const notificationServices = {
  Addnotificationservices: async (notificationdata) => { 
    let status;
    if (!notificationdata.course_id && !notificationdata.batchId) {
      status = "public";
    } else {
      status = "private";
    }

    // Get student data
    const studentdata = await studentRepositorie.getData();

    for (const student of studentdata) {
      if (student.fcm_key) {
        await sendNotification(student.fcm_key, notificationdata.head, notificationdata.description);
      }
    }

    // Create notification (without status)
    const createdNotification = await NotificationRepositorie.create(notificationdata);

    // Add status to response manually
    return {
      ...createdNotification.dataValues, // or .toJSON()
      status: status
    };
  }
  ,
getallnotificationservices: async () => {
  const daata = await NotificationRepositorie.getData();

  // Simple array of plain objects with added status
  const simplifiedData = daata.map(item => {
    const batchId = item.dataValues.batchId;
    const course_id = item.dataValues.course_id;

    const status = (batchId == null && course_id == null) ? "public" : "private";

    return {
      ...item.dataValues,
      status: status
    };
  });

  return simplifiedData;
},

  // deletenotifactionservices: async (data) => {
  //     console.log("i am data ", data)
  //     const notifactionid = await NotificationRepositorie.getDataById(data);
  //     if (!notifactionid) {
  //         throw new Error("id not found");
  //     }
  //     return await NotificationRepositorie.deleteData({ id: data })
  // }
  deletenotifactionservices: async (data) => {
    try {
      console.log("I am data:", data);

      const notifaction = await NotificationRepositorie.getDataById(data);
      if (!notifaction) {
        throw new customError("ID not found");
      }

      const deleted = await NotificationRepositorie.deleteData(data);

      return { success: true, message: "Notification deleted", deleted };
    } catch (error) {
      console.error("Delete Error:", error);
      throw new customError("Internal server error");
    }
  }



}

module.exports = notificationServices











// data.fcm_key{
//     title and description send kar do
// }