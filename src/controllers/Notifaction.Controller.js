 const notificationServices = require("../services/Notification.services");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");

const NotifactionController  = {
    addnotifactioncontroller : try_catch(async(req,res)=>{
        // const {head,description,batchId} = req.body
        // if (!head || !description  || !batchId) {
        //     throw new customError("All fields are required", 400);
        // }
        const data = await notificationServices.Addnotificationservices(req.body)
        // console.log("i am data : ",req.body)
        if (!data) {
            throw new customError("All fields are required", 400);
        }
        res.status(201).json({
            status: "success",
            message: "Add Notification Succesfully : ",
            data: data
        });
    }),
    getallnotificationcontroller : try_catch(async(req,res)=>{

        const data = await notificationServices.getallnotificationservices()
        if (!data) {
            throw new customError("All fields are required", 400);
        }
        res.status(201).json({
            status: "success",
            message: "All Notification : ",
            data: data
        });
    }),
    deleteallnotificationcontroller : try_catch(async(req,res)=>{
        const {id} = req.params
        const data = await notificationServices.deletenotifactionservices(id)
        if (!data) {
            throw new customError("All fields are required", 400);
        }
        res.status(201).json({
            status: "success",
            message: "All Batch : ",
            data: data
        });
    }),
}

module.exports = NotifactionController;