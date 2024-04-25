const bcrypt = require('bcrypt');
const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EmployeeAttendance',
  password: 'sa2547',
  port: 5432,
});

const getLogin = async(request,response) => {
    pool.query('SELECT * FROM login',(error, result) => {
        if(error) {
            throw error;
        }
        response.status(200).json(result.rows);
    });
};

const createLogin = async (request, response) => {
  const { username, password } = request.body;

  try {
    const result = await pool.query('SELECT * FROM register WHERE username = $1', [username]);

    if (result.rows.length > 0) {
      const storedPassword = result.rows[0].password;

      const passwordMatch = await bcrypt.compare(password, storedPassword);

      if (passwordMatch) {
        response.json({ success: true, message: 'Login successful' });
        console.log({ success: true, message: 'Login successful' })
      } else {
        response.status(401).json({ success: false, message: 'Invalid  password' });
        console.log({ success: false, message: 'Invalid  password' })
      }
    } else {
      response.status(401).json({ success: false, message: 'Invalid username' });
      console.log({ success: false, message: 'Invalid username' })
    }
    
  } catch (error) {
    console.error('Error executing query', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
};


module.exports = {
    getLogin,
  createLogin,
};
