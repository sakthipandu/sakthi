const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
const PDFDocument = require('pdfkit');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'sa2547',
  port: 5432,
});

const createDatabase = async (request, response) => {
  const { name, email_id, phone_no } = request.body;
  let clientDatabase;  // Declare clientDatabase outside the try block

  try {
    await pool.connect();
    await pool.query(`CREATE DATABASE ${name}`);

    clientDatabase = new Pool({
      user: 'postgres',
      password: 'sa2547',
      port: 5432,
      host: 'localhost',
      database: name,
    });

    await clientDatabase.connect();

    const createTableQuery = `CREATE TABLE IF NOT EXISTS "user" (id serial primary key, name varchar(250), email_id varchar(250), phone_no BIGINT)`;

    await clientDatabase.query(createTableQuery);

    await clientDatabase.query('INSERT INTO "user" (name, email_id, phone_no) VALUES ($1, $2, $3)',
      [name, email_id, phone_no]);

    response.status(200).json({ message: 'database created successfully' });
  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal server error' });
  } finally {
    if (clientDatabase) {
      await clientDatabase.end();
    }
  }
};

const get = async (request, response) => {
  const name = request.params.name;

  const sequelize = new Sequelize({
    dialect: 'postgres',
    username: 'postgres',
    password: 'sa2547',
    port: 5432,
    host: 'localhost',
    database: name,
  });
  const User = sequelize.define('user');

  try {
    await sequelize.authenticate();
    console.log('Connected to the database');

    await User.sync();
    await sequelize.sync({ force: false });

    const users = await sequelize.query('SELECT * FROM "user"', { type: Sequelize.QueryTypes.SELECT });

    const doc = new PDFDocument();
    doc.pipe(response);

    doc.fontSize(25).fillColor('blue').font('Helvetica-Bold').text('User List', { align: 'center' });
    doc.moveDown();

    users.forEach((user) => {
      doc.fontSize(20).fillColor('black').text(`Name: ${user.name},\nEmail: ${user.email_id},\nPhoneNumber: ${user.phone_no}`);
      doc.moveDown();
      doc.addPage();
    });
    doc.end();
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error:', error);
    response.status(500).send('Internal Server Error');
  }
};



module.exports = {
  createDatabase,
  get,
};
