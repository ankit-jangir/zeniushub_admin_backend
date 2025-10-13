const { getDepartmentWiseSalaries } = require('../services/Salary.service');
const { try_catch } = require('../utils/tryCatch.handler');

const getSalaryStatus = async (req, res) => {
    try {
        // const data = await getDepartmentWiseSalaries();
        const data = await getDepartmentWiseSalaries.getsalary(req.query.department_name)
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getSalaryCount = async (req, res) => {
    try {
        const { department, name, page, limit } = req.query
        const data = await getDepartmentWiseSalaries.salerycount(department, name, page, limit)
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
const salerycreatecontroller = try_catch(async (req, res) => {
    // const { from_date, to_date } = req.body  
    const {emp_id, from_date, to_date}=req.query 
    const data = await getDepartmentWiseSalaries.salerycreate(emp_id, from_date, to_date)
    return res.status(200).json({ success: true, data });
})
const salerycreateEmployecontroller = try_catch(async (req, res) => {
        const { from_date, to_date,amount } = req.body
    const {emp_id}=req.query
    // console.log(emp_id,amount,from_date,to_date)
    const data = await getDepartmentWiseSalaries.salerycreateEmploye(emp_id, amount, from_date, to_date)
    return res.status(200).json({ success: true, data });
})
const particularEmployeDetails = try_catch(async (req, res) => {
    let { emp_id, page = 1, limit = 10 } = req.query;

    emp_id = parseInt(emp_id?.trim());

    if (isNaN(emp_id)) {
        return res.status(400).json({ success: false, message: "Invalid emp_id" });
    }

    const result = await getDepartmentWiseSalaries.particularEmploye(emp_id, parseInt(page), parseInt(limit));

    return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
    });
});

const upcomingsaleryController = try_catch(async (req, res) => {
  const { employe_id } = req.query;

  console.log("Query Params:", req.query);
  const employee_id = Number(employe_id); // ✅ Corrected spelling

  console.log("Parsed employee_id:", employee_id);

  const data = await getDepartmentWiseSalaries.upcomingsalery(employee_id);
  return res.status(200).json({ success: true, data });
});




module.exports = { getSalaryStatus, getSalaryCount, salerycreatecontroller, salerycreateEmployecontroller, particularEmployeDetails, upcomingsaleryController };
