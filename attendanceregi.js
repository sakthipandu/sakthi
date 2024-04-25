const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'EmployeeAttendance',
    password: 'sa2547',
    port: 5432,
  });

const getAttendanceById = async (request, response) => {
    const employeeId = request.params.employeeId;
  
    pool.query('SELECT * FROM attendance WHERE employeeid = $1', [employeeId], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0] && results.rows[0].image) {
        const base64 = results.rows[0].image;
        const src = "" + base64;
        results.rows[0].editImage = src;
        // console.log(results.rows[0].editImage);
      }
  
      response.status(200).json(results.rows);
    });
  };
  
  const createAttendance = async (req, res) => {
    const { employeeid, image } = req.body;
    const currentTime = new Date();
    const allowedTime = new Date(currentTime);
    allowedTime.setHours(13, 0, 0, 0); // Adjust this based on your check-in time
  
    const currentDate = new Date().toISOString().split('T')[0];
  
    try {
        let result;
  
        if (currentTime < allowedTime) {
            // Check-in
            result = await pool.query(
                'INSERT INTO attendance (employeeid, image, date, intime, outtime) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [employeeid, image, currentDate, currentTime, null]
            );
            return res.status(200).json({ message: 'Time in successful', data: result.rows[0] });
        } else {
            // Check if the current time is within the allowed expiration limit (e.g., one day)
            const expirationLimit = new Date(allowedTime);
            expirationLimit.setDate(expirationLimit.getDate() + 1); // One day later
  
            if (currentTime > expirationLimit) {
                return res.status(400).json({ message: 'Time out not allowed after expiration limit' });
            }
  
            // Check-out
            result = await pool.query(
                'UPDATE attendance SET outtime = $1 WHERE employeeid = $2 AND outtime IS NULL RETURNING *',
                [currentTime, employeeid]
            );
            return res.status(200).json({ message: 'Time out successful', data: result.rows[0] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  const updateAttendance = async (request, response) => {
    const id = parseInt(request.params.id);
    const { employeeid, image, date, intime, outtime } = request.body;
  
    // Check if outtime is an empty string and replace it with null
    const formattedOuttime = outtime === '' ? null : outtime;
  
    pool.query(
      'UPDATE attendance SET employeeid = $1, image = $2, date = $3, intime = $4, outtime = $5 WHERE id = $6',
      [employeeid, image, date, intime, formattedOuttime, id],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).send(`Employee update with ID: ${id}`);
      }
    );
  };
    
  module.exports = 
  {
      // getAttendance,
      createAttendance,
      getAttendanceById,
      updateAttendance
  }
  