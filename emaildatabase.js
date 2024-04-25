const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const { Sequelize } = require('sequelize');
const PDFDocument = require('pdfkit');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  password: 'sa2547',
  port: 5432, 
  host: 'localhost',
  database: '',
});

const createDatabase = async (request, response) => {
  const { name, email_id, phone_no, password } = request.body;
  let clientDatabase; 
  
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await pool.connect();
    await pool.query(`CREATE DATABASE ${name}`);

    const clientDatabase = new Pool({
      user: 'postgres',
      password: 'sa2547',
      port: 5432,
      host: 'localhost',
      database: name,
    });

    await clientDatabase.connect();

    const createTableQuery = `CREATE TABLE IF NOT EXISTS "user" (id serial primary key, name varchar(40) NOT NULL, email_id varchar(50) NOT NULL, phone_no BIGINT NOT NULL, password varchar(250) NULL, otp INTEGER)`;
    await clientDatabase.query(createTableQuery);

    await clientDatabase.query('INSERT INTO "user" (name, email_id, phone_no, password, otp) VALUES ($1, $2, $3, $4, $5)',
      [name, email_id, phone_no, password, otp]);

    await sendOTPEmail(email_id, otp,name, response);

  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal server error' });
  } finally {
    if (clientDatabase) {
      await clientDatabase.end();
    }
  }
};

async function sendOTPEmail(email, otp, name, response) {
  const transporter = nodemailer.createTransport({
    ost: "smtp.gmail.com",
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
      user: 'sakthi032vel@gmail.com',
      pass: 'ttjzpkoyqhgdzond',
    },
  });

 const mailOptions = {
  from: 'sakthi032vel@gmail.com',
  to: email,
  subject: 'Your OTP for Verification',        
  html: `<p><font color="red" size = "6" style = "timesnewromen">Your OTP is: </font><font color="black" size = "7"><strong>${otp}</strong></font></p>`
};

  try {
    await transporter.sendMail(mailOptions);
    response.status(200).json({ message: 'OTP sent successfully email' });
  } catch (error) {
    console.error('Error sending email:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}

const verifyOTP = async (request, response) => {
  const { name, otp, } = request.body;
  let clientDatabase;

  try {
    await pool.connect();

    clientDatabase = new Pool({
      user: 'postgres',
      password: 'sa2547',
      port: 5432,
      host: 'localhost',
      database: name,
    });

    const result = await clientDatabase.query('SELECT * FROM "user"  name  WHERE  name = $1 AND otp = $2', [name, otp]);

    if (result.rows.length === 1) {
      response.status(200).json({ message: 'OTP verified successfully' });
    }
    else {
      response.status(400).json({ error: 'Invalid OTP' });
    }
  } 
  catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal server error' });
  } 
  finally {
    if (clientDatabase) {
      await clientDatabase.end();
    }
  }
};

const getPdf = async (request, response) => {
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

    doc.fontSize(25).fillColor('blue').font('Helvetica-Bold').text('User Details', { align: 'center' });
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

const createLogin = async (request, response) => {
  const { password, name } = request.body;
  try {
    const pool = new Pool({
      user: 'postgres',
      password: 'sa2547',
      port: 5432, 
      host: 'localhost',
      database:name,
    });

    const result = pool.query('SELECT * FROM "user" WHERE name = $1', [name]);

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
      response.status(401).json({ success: false, message: 'Invalid emailid' });
      console.log({ success: false, message: 'Invalid emailid' })
    }
    
  } catch (error) {
    console.error('Error executing query', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createDatabase,
  verifyOTP,
  getPdf,
  createLogin
};
