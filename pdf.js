const express = require('express');
const { Sequelize} = require('sequelize');
const PDFDocument = require('pdfkit');


const sequelize = new Sequelize('EmployeeAttendance', 'postgres', 'sa2547', {
  host: 'localhost',
  dialect: 'postgres',
});

const Employee = sequelize.define('Employee');

const get = async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database');

    await Employee.sync();

    const employees = await sequelize.query('SELECT * FROM "employee"', { type: Sequelize.QueryTypes.SELECT });

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(16).text('Employee List', { align: 'center' });
    doc.moveDown();

    employees.forEach((employee) => {
      doc.text(`Name: ${employee.name},
      \nEmployeeid: ${employee.employeeid},
      \nDate of Birth: ${employee.dob},
      \nLocation: ${employee.location},
      \nMarital Status: ${employee.maritalstatus},
      \nGender: ${employee.gender},
      \nAddress: ${employee.address},
      \nEmail: ${employee.email}`); 
      doc.addPage();
    });
    doc.end();
    console.log('PDF generated successfully');
  } 
  catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  get,
};
