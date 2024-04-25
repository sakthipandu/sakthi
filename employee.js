const Pool = require('pg').Pool;
const bcrypt = require('bcrypt');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EmployeeAttendance',
  password: 'sa2547',
  port: 5432,
});

const getEmployee = async (request, response) => {
  try {
    const result = await pool.query('SELECT * FROM sakthi');
    response.status(200).json(result.rows);
  } 
  catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

const getEmployeeById = async (request, response) => {
  const { employeeid } = request.params;

  // console.log('Received request with employeeid:', employeeid);

  try {
    let result;

    if (employeeid) {
      result = await pool.query('SELECT * FROM employee WHERE employeeid = $1', [employeeid]);
    } else {
      return response.status(400).json({ error: 'Please provide either id or employeeid' });
    }

    if (result.rows.length > 0) {
      const employee = result.rows[0];
      if (employee.image) {
        const base64 = employee.image;
        const src = "" + base64;
        employee.editImage = src;
        // console.log(result.rows[0].editImage);
      }

      response.status(200).json(employee);
    } else {
      response.status(404).json({ error: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};


const getEmployeesById = async (request, response) => {
  const id = parseInt(request.params.id);

  console.log('Received request with id:', id);

  try {
    const result = await Promise.all([
      pool.query('SELECT * FROM employee WHERE id = $1', [id]),
    ]);

    
    if (result.rows.length > 0) {
      const employee = result.rows[0];
      if (employee.image) {
        const base64 = employee.image;
        const src = "" + base64;
        employee.editImage = src;
        // console.log(result.rows[0].editImage);
      }

      response.status(200).json(mergedResults);
    } else {
      response.status(404).json({ error: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

const saltRounds = 10;

const createEmployee = async (request, response) => {
  try {
    const {
      image,name,employeeid,designation,dob,education,location,maritalstatus,gender,address,phonenumber,altphoneno,email,officialemail,status,password,} = request.body;

    const checkUserQuery = 'SELECT * FROM employee WHERE employeeid = $1';
    const userCheckResult = await pool.query(checkUserQuery, [employeeid]);

    if (userCheckResult.rows.length > 0) {
      return response.status(400).json({ error: 'name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const employeeInsertQuery =
      'INSERT INTO employee (image, name, employeeid, designation, dob, education, location, maritalstatus, gender, address, phonenumber, altphoneno, email, officialemail, status, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)';
    await pool.query(employeeInsertQuery, [image,name,employeeid,designation,dob,education,location,maritalstatus,gender,address, phonenumber,altphoneno,email,officialemail,status,hashedPassword,]);
    const token = jwt.sign({ employeeid }, jwtSecret);
    response.status(201).json({ token });
  } catch (error) {
    console.error('Error during registration:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};

const updateEmployee = async (request, response) => {
  const id = parseInt(request.params.id);
  const {image,name,employeeid,designation,dob,education,location,maritalstatus,gender,address,phonenumber,altphoneno,email,officialemail,status, password,} = request.body;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const updateQuery =
    'UPDATE employee SET image = $1, name = $2,  employeeid = $3, designation = $4, dob = $5, education = $6, location = $7, maritalstatus = $8, gender = $9, address = $10, phonenumber = $11, altphoneno = $12, email = $13, officialemail = $14, status = $15, password = $16 WHERE id = $17';

  await pool.query(updateQuery, [image,name,employeeid,designation,dob,education,location,maritalstatus,gender,address,phonenumber,altphoneno,email,officialemail,status, hashedPassword,id,]);

  response.status(200).send(`Employee modified with ID: ${id}`);
};

const deleteEmployee = async (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM employee WHERE id = $1',[id],(error, results) => {
    if(error) {
      throw error;
    }
    response.status(200).send(`employee deleted with ID: ${id}`);
  })
}
  
module.exports = {
      getEmployee,
      createEmployee,
      getEmployeeById,
      updateEmployee,
      deleteEmployee,
      getEmployeesById
}