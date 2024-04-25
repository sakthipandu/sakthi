const express = require('express');
const bodyParser = require('body-parser');
// const { format } = require('date-fns');
const cors = require('cors');
const doenv = require("dotenv");
const multer = require('multer'); 
const bcrypt = require('bcrypt');
const pgp = require('pg-promise')();
const jwt = require('jsonwebtoken')
const dp = multer().any();
const employee = require('./employee');
const login = require('./login');
const register = require('./register');
const empop = require('./empop');
const login2 = require('./login2');
const permission = require('./permission');
const leave =  require('./leave');
const newdatabase = require('./newdatabase');
const pdf = require('./pdf')
const pdfexample = require('./pdfexample')
const emaildatabase = require('./emaildatabase');
const email = require('./email');
const attendanceregi = require('./attendanceregi');
const tablecreate= require('./tablecreate')

const app = express();
const port = 6000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ message: 'Hello World' });
});

// app.use(function(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });

app.get('/employees',employee.getEmployee);
app.get('/employees/:id',employee.getEmployeesById);
app.get('/employee/:employeeid',employee.getEmployeeById);
app.post('/employees',employee.createEmployee);
app.put('/employees/:id',employee.updateEmployee);
app.delete('/employees/:id',employee.deleteEmployee);

app.get('/employeeoption',empop.getEmployeeoptions);
app.post('/employeeoption',empop.createEmployeeoptions);

app.get('/adminlogin',login.getLogin);
app.post('/adminlogin',login.createLogin);

app.get ('/user',register.getRegister);
app.post('/user',register.createRegister);
app.delete('/user/:id',register.deleteRegister);

// app.get('/attendance/:employeeId', regi.getAttendance);
app.get('/attendance/:employeeId', attendanceregi.getAttendanceById);
app.post('/attendance', attendanceregi.  createAttendance);
app.put('/attendance/:id', attendanceregi.  updateAttendance);


app.post('/userlogin',login2.createLogin);

app.get('/permission', permission. getPermission);
app.post('/permission', permission.verifyToken, permission.createPermission);
app.post('/permissions', permission.verifyToken, permission.createPermissions);

app.get('/leave', leave.getLeave);
app.post('/leave', leave.verifyToken, leave.createLeave);
app.post('/leaves',leave.verifyToken,leave.createLeaves);

app.post('/data', newdatabase.createDatabase);
app.get('/data-pdf/:name', newdatabase.get);

app.get('/generate-pdf', pdf.get);

app.get('/pdf', pdfexample.get);

app.post('/db', emaildatabase.createDatabase);
app.post('/verifyotp',emaildatabase.verifyOTP)
app.get('/pdfgenerate/:name', emaildatabase.getPdf)
app.post('/clintlogin',emaildatabase.createLogin);


app.post('/addtable',tablecreate.createTable);
app.post('/values',tablecreate.createValues);
app.get('/getcol/:tableName',tablecreate.getColumns);
app.get('/gst/:productId',tablecreate.getproducts);
app.post('/invoice',tablecreate.createproducts);




app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
