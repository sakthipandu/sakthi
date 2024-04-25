const { Pool } = require('pg');
const PDFDocument = require('pdfkit');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EmployeeAttendance',
  password: 'sa2547',
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const get = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employee');
    const pdfBuffer = await generatePDF(result.rows);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=output.pdf');
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
};

async function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    doc.fontSize(16).text('Employee List', { align: 'center' });
    doc.moveDown();
    data.forEach((row) => {
      doc.text(`Name: ${row.name},
                Employeeid: ${row.employeeid},
                Date of Berth: ${row.dob},
                Location: ${row.location},
                Maritalstatus: ${row.maritalstatus},
                Gender: ${row.gender},
                Address: ${row.address},
                email: ${row.email}`);
      doc.addPage();
    });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

module.exports = {
  get,
};
