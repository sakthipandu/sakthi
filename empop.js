const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EmployeeAttendance',
  password: 'sa2547',
  port: 5432,
});

const getEmployeeoptions = async (request,response) => {
    pool.query('SELECT * FROM employee', (error,results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const createEmployeeoptions = async (request,response) => {
    const {name, value} = request.body;

    pool.query('INSERT INTO employeeoptions (name, value) VALUES ($1, $2)',[name,value],(error,results) => {
        if(error) {
            throw error;
        }
        response.status(200).send(`employeeoptions added with ID: ${results.insertId}`)
    })
}



module.exports = {
    getEmployeeoptions,
    createEmployeeoptions
}


