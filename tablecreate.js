const { request } = require('express');

const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'EmployeeAttendance',
    password: 'sa2547',
    port: 5432,
  });
  
  const createTable = async (request, response) => {
    const { tableName, columns } = request.body;
  
    try {

     await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`);
      console.log('Table:', tableName);
  
      response.status(200).json({ message: 'Table created successfully' });
    } 
    catch (error) {
      console.error('Error:', error.message);
      response.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const createValues = async (request, response) => {
    const {tableName,columnValues} = request.body;

    try{

        if (columnValues && columnValues.length > 0) {
            const columnsList = Object.keys(columnValues[0]).join(', ');
            const valuesList = columnValues.map(valueObj =>
              Object.values(valueObj).map(val => `'${val}'`).join(', ')
            );
      
            await pool.query (`INSERT INTO ${tableName} (${columnsList}) VALUES (${valuesList.join('), (')})`);
            console.log('SQL Insert Query:', valuesList);
          }
      
          response.status(200).json({ message: 'Table  data inserted successfully' });
      
        } 
        catch (error) {
          console.error('Error:', error.message);
          response.status(500).json({ error: 'Internal server error' });
        }
  }

// Endpoint to get column names
const getColumns = async (req, res) => {
    const tableName = req.body.tableName;
  try {
   
    const tableExistsResult = await pool.query(('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1);'), [tableName]);
    const tableExists = tableExistsResult.rows[0].exists;

    if (tableExists) {
      const columnsResult = await pool.query((` SELECT column_name FROM information_schema.columns WHERE table_name = $1;`), [tableName]);
      const columns = columnsResult.rows.map(row => row.column_name);

      res.status(200).json({ columns });

    } else {
      res.status(404).json({ error: 'Table does not exist' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

function calculateGST(price) {
  const GST_RATE = 0.18; 
  return price * GST_RATE;
}

const getproducts = async(request, responce) => {
const productId = request.params.productId;
try {
  const result = await pool.query('SELECT price FROM products WHERE id = $1', [productId]);
  if (result.rows.length === 0) {
    return responce.status(404).json({ message: 'Product not found' });
  }
  const price = result.rows[0].price;
  const gstAmount = calculateGST(price);
  return responce.json({ gstAmount });
} catch (error) {
  console.error('Error executing query', error);
  return responce.status(500).json({ message: 'Internal server error' });
}
};


const createproducts = async (request, response) => {
  const { customerName, productId, discount } = request.body;
  try {
    const productResult = await pool.query('SELECT price FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return response.status(404).json({ message: 'Product not found' });
    }
    const price = parseFloat(productResult.rows[0].price);
    const gstAmount = parseFloat(calculateGST(price));
    const totalAmount = price - discount + gstAmount;
    
    const invoiceResult = await pool.query('INSERT INTO invoices (customer_name, total_amount) VALUES ($1, $2) RETURNING id', [customerName, totalAmount]);
    const invoiceId = invoiceResult.rows[0].id;
    return response.json({ invoiceId, totalAmount });
  } catch (error) {
    console.error('Error executing query', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
};



  module.exports = {
    createTable,
    createValues,
    getColumns,
    createproducts,
    getproducts
  }
  