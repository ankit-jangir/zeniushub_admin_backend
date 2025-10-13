const { departmentservice } = require("../services/department.services");
const { try_catch } = require("../utils/tryCatch.handler");
const customError = require("../utils/error.handler");
const departmentValidationSchema = require("../validators/departmentValidator");

const departmentController = {
 adddepartment: try_catch(async (req, res) => {
  const data = await departmentservice.adddepartment(req.body);

  res.status(201).json({
    message: "Department created successfully",
    data,
  });
})


    ,
    getdepartment: try_catch(async (req, res) => {
        const {name} = req.query
        const data = await departmentservice.getdepartment(name);
        res.status(200).json({ message: "Departments retrieved successfully", data });
    }),
    getOnedepartment: try_catch(async (req, res) => {
        const data = await departmentservice.getOnedepartment(req.body.id);
        res.status(200).json({ message: "Single department retrieved successfully", data });
    }),
    updatedepartment: try_catch(async (req, res) => {
        const { id, name, access_control } = req.body;
        const data = await departmentservice.updatedepartment(id, name, access_control);
        res.status(200).json({ message: "Department updated successfully", data });
    }),
    delete: try_catch(async (req, res) => {
        const data = await departmentservice.delete(req.body.id);
        res.status(200).json({ message: "Department deleted successfully", data });
    }),
    accessdepartment: try_catch(async (req, res) => {
        await departmentservice.accessdepartment(req.query.id, req.query.array);
        res.send({ message: "Access control added successfully" });
    }),
    getAccessDepartment: try_catch(async (req, res) => {
        const department = await departmentservice.getAccessDepartment(req.query.id);
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json(department);
    }),
 
    getAccessControl: try_catch(async (req, res) => {
        const department = await departmentservice.getAccessControl(req.query.id);
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json(department);
    }),
    getAllAccessControl: try_catch(async (req, res) => {
        const department = await departmentservice.getAllAccessControl()
        // if (!department) {
        //     return res.status(404).json({ message: "Department not found" });
        // }
        return res.status(200).json({ message: "success",department });
    }),
 
    updateAccessDepartment: try_catch(async (req, res) => {
        const { id } = req.query;
        const { accessControlIds } = req.query;
        console.log(accessControlIds, id, "rajat");
        const department = await departmentservice.updateAccessDepartmentt(id, accessControlIds);
        res.status(200).json({ message: "Access control updated successfully", department });
    }),
    filterdata: try_catch(async(req,res)=>{
        const id = req.body;
        const data = await departmentservice.datafilterservices(id);

        // const finaldata = await 
        res.status(200).json({
            status:"success",
            data:data
        })
    })
};

module.exports = { departmentController };
