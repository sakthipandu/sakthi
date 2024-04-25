const bcrypt = require('bcrypt');
const Pool = require('pg').Pool;
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_secret_key'; 
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EmployeeAttendance',
  password: 'sa2547',
  port: 5432,
});

const createLogin = async (request, response) => {
  const { employeeid, password } = request.body;

  try {

    const result = await pool.query('SELECT * FROM employee WHERE employeeid = $1', [employeeid]);

    if (result.rows.length > 0) {
      const storedPassword = result.rows[0].password;
      const passwordMatch = bcrypt.compareSync(password, storedPassword);

      if (passwordMatch) {
        const newToken = jwt.sign({ employeeid: result.rows[0].employeeid }, jwtSecret);
        response.json({ success: true, message: 'Login successful', token: newToken });
      } else {
        response.status(401).json({ success: false, message: 'Invalid password' });
      }
      // console.log({ employeeid: result.rows[0] });
    } else {
      response.status(401).json({ success: false, message: 'Invalid employeeid' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createLogin,
};
