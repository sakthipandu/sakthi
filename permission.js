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

  if (!token || !token.startsWith('Bearer ')) {
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
};


const getPermission = async (req, res) => {
  pool.query('SELECT * FROM permission', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

const createPermission = async (request, response) => {
  try {
    const { date, hour, fromtime, totime, permissionreason } = request.body;
    const { employeeid } = request;

    if (!employeeid) {
      return response.status(401).json({ error: 'Unable to retrieve employeeid from token' });
    }

    const client = await pool.connect();
    try {
    
      const resultPermission = await client.query(
        'INSERT INTO permission (employeeid, date, hour, fromtime, totime, permissionreason) VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
        [employeeid, date, hour, fromtime, totime, permissionreason]
      );
      response.status(200).json({ message: 'Permission applied successfully' });
    } 
    catch (error) {
      throw error;
    }
     finally {
      client.release();
    }
  }
   catch (error) {
    console.error('Error applying permission:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};

const createPermissions = async (request, response) => {
  try {
    const { date, hour, permissionreason } = request.body;
    const { employeeid } = request;

    if (!employeeid) {
      return response.status(401).json({ error: 'Unable to retrieve employeeid from token' });
    }

    const client = await pool.connect();
    try {

      const resultAttendance = await client.query(
        'INSERT INTO attendance (employeeid, date, hour, permissionreason) VALUES($1, $2, $3, $4) RETURNING id',
        [employeeid, date, hour, permissionreason]
      );
      
      const Id = resultAttendance.rows[0].id;

      await client.query('DELETE FROM leave WHERE id = $1', [Id]);

      response.status(200).json({ message: 'Permission applied successfully' });
    } 
    catch (error) {
      throw error;
    }
     finally {
      client.release();
    }
  } 
  catch (error) {
    console.error('Error applying permission:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  getPermission,
  createPermission,
  verifyToken,
  createPermissions
};






