const bcrypt = require('bcrypt');
const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EmployeeAttendance',
  password: 'sa2547',
  port: 5432,
});

const saltRounds = 10;

const getRegister = async (request, response) => {
  try {
    const result = await pool.query('SELECT * FROM register');
    response.status(200).json(result.rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};

const createRegister = async (request, response) => {
  const { username, email, password } = request.body;
  try {
    const checkUserQuery = 'SELECT * FROM register WHERE username = $1';
    const userCheckResult = await pool.query(checkUserQuery, [username]);

    if (userCheckResult.rows.length > 0) {
      return response.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertUserQuery =
      'INSERT INTO register (username, email, password) VALUES ($1, $2, $3) RETURNING *';
    const newUser = await pool.query(insertUserQuery, [username, email, hashedPassword]);

    response.status(201).json(newUser.rows[0]);
  }
  catch (error) {
    console.error('Error during registration:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRegister = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    const result = await pool.query('DELETE FROM register WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return response.status(404).json({ error: 'Register not found' });
    }

    response.status(200).json({ message: `Register deleted with ID: ${id}`, deletedRegister: result.rows[0] });
  }
  catch (error) {
    console.error('Error during deletion:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getRegister,
  createRegister,
  deleteRegister,
};
