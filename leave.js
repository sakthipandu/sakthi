const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool;
const jwtSecret = 'your_secret_key';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EmployeeAttendance',
  password: 'sa2547',
  port: 5432,
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer')) {
    return res.status(403).json({ success: false, message: 'No token provided' });
  }

  const tokenWithoutBearer = token.split(' ')[1];

  jwt.verify(tokenWithoutBearer, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Failed to authenticate token' });
    }
  
    if (!decoded.employeeid) {
      return res.status(401).json({ error: 'Unable to retrieve employeeid or from token' });
    }
  
    console.log('Decoded Token:', decoded); 
  
    req.employeeid = decoded.employeeid;
    next();
  });
}

const getLeave = async (req, res) => {
  pool.query('SELECT * FROM leave', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

const createLeave = async (req, res) => {
  try {
    const { date, leavetype, reason } = req.body;
    const { employeeid } = req;

    if (!employeeid) {
      return res.status(401).json({ error: 'Unable to retrieve employeeid or name from token' });
    }

    const client = await pool.connect();
    try {
      const employeeQuery = await client.query('SELECT name FROM employee WHERE employeeid = $1', [employeeid]);

      if (employeeQuery.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const name = employeeQuery.rows[0].name;

      await client.query('INSERT INTO leave (employeeid, name, date, leavetype, reason) VALUES($1, $2, $3, $4, $5) RETURNING id', [employeeid, name, date, leavetype, reason]);

      await admin.messaging().sendToDevice(registrationToken, payload);

      res.status(200).json({ message: 'Leave applied successfully' });
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error applying leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createLeaves = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    const { date, leavetype, reason } = req.body;
    const { employeeid } = req;

    if (!employeeid) {
      return res.status(401).json({ error: 'Unable to retrieve employeeid or name from token' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const resultAttendance = await client.query(
        'INSERT INTO attendance (employeeid, date, leavetype, reason) VALUES($1, $2, $3, $4) RETURNING id',
        [employeeid, date, leavetype, reason]
      );

      const attendanceId = resultAttendance.rows[0].id;

      await client.query(
        'DELETE FROM leave WHERE employeeid = $1 AND date = $2',
        [employeeid, date]
      );

      await admin.messaging().sendToDevice(registrationToken, payload);

      await client.query('COMMIT');
      res.status(200).json({ message: 'Leave approved' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error recording attendance and deleting leave:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error recording attendance and deleting leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLeave,
  createLeave,
  verifyToken,
  createLeaves
};

