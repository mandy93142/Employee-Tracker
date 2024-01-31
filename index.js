require('dotenv').config();
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(err => {
  if (err) throw err;
});

// Main menu function
function mainMenu() {
    inquirer.prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employee Role',
        'Exit'
      ]
    })
    .then(answer => {
      switch (answer.action) {
        case 'View All Departments':
          viewDepartments();
          break;
        case 'View All Roles':
          viewRoles();
          break;
        case 'View All Employees':
          viewEmployees();
          break;
        case 'Add a Department':
          addDepartment();
          break;
        case 'Add a Role':
          addRole();
          break;
        case 'Add an Employee':
          addEmployee();
          break;
        case 'Update an Employee Role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          break;
      }
    });
  }

  // View departments
function viewDepartments() {
    const query = 'SELECT * FROM department';
    connection.query(query, (err, res) => {
      if (err) throw err;
      consoleTable(res);
      mainMenu();
    });
  }

  // Add department
function addDepartment() {
    inquirer.prompt({
      name: 'newDepartment',
      type: 'input',
      message: 'What is the name of the new department?'
    })
    .then(answer => {
      const query = 'INSERT INTO department (name) VALUES (?)';
      connection.query(query, answer.newDepartment, (err, res) => {
        if (err) throw err;
        console.log('Department added successfully!');
        mainMenu();
      });
    });
  }

  // View roles
function viewRoles() {
    const query = 'SELECT role.id, role.title, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id = department.id';
    connection.query(query, (err, res) => {
      if (err) throw err;
      consoleTable(res);
      mainMenu();
    });
  }
  
  // View employees
  function viewEmployees() {
    const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, \' \', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id';
    connection.query(query, (err, res) => {
      if (err) throw err;
      consoleTable(res);
      mainMenu();
    });
  }

  // Add department
function addDepartment() {
    inquirer.prompt({
      name: 'newDepartment',
      type: 'input',
      message: 'What is the name of the new department?'
    })
    .then(answer => {
      const query = 'INSERT INTO department (name) VALUES (?)';
      connection.query(query, answer.newDepartment, (err, res) => {
        if (err) throw err;
        console.log('Department added successfully!');
        mainMenu();
      });
    });
  }
  
  // Add role
  function addRole() {
    connection.query('SELECT * FROM department', (err, departments) => {
      if (err) throw err;
      inquirer.prompt([
        {
          name: 'title',
          type: 'input',
          message: 'What is the title of the new role?'
        },
        {
          name: 'salary',
          type: 'input',
          message: 'What is the salary for this role?',
          validate: value => !isNaN(value)
        },
        {
          name: 'department',
          type: 'list',
          choices: departments.map(department => ({ name: department.name, value: department.id })),
          message: 'Which department does this role belong to?'
        }
      ])
      .then(answer => {
        const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
        connection.query(query, [answer.title, answer.salary, answer.department], (err, res) => {
          if (err) throw err;
          console.log('Role added successfully!');
          mainMenu();
        });
      });
    });
  }
  
  // Add employee
  function addEmployee() {
    let roles, employees;
    connection.promise().query('SELECT id, title FROM role')
      .then(([rows]) => {
        roles = rows;
        return connection.promise().query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
      })
      .then(([rows]) => {
        employees = rows;
        return inquirer.prompt([
          {
            name: 'firstName',
            type: 'input',
            message: 'What is the employee\'s first name?'
          },
          {
            name: 'lastName',
            type: 'input',
            message: 'What is the employee\'s last name?'
          },
          {
            name: 'role',
            type: 'list',
            choices: roles.map(role => ({ name: role.title, value: role.id })),
            message: 'What is the employee\'s role?'
          },
          {
            name: 'manager',
            type: 'list',
            choices: [{ name: 'None', value: null }].concat(employees.map(employee => ({ name: employee.name, value: employee.id }))),
            message: 'Who is the employee\'s manager?'
          }
        ]);
      })
      .then(answer => {
        const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
        connection.query(query, [answer.firstName, answer.lastName, answer.role, answer.manager], (err, res) => {
          if (err) throw err;
          console.log('Employee added successfully!');
          mainMenu();
        });
      })
      .catch(err => {
        throw err;
      });
  }

  // Update employee role
  function updateEmployeeRole() {
    let employees, roles;
    connection.promise().query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee')
      .then(([rows]) => {
        employees = rows;
        return connection.promise().query('SELECT id, title FROM role');
      })
      .then(([rows]) => {
        roles = rows;
        return inquirer.prompt([
          {
            name: 'employee',
            type: 'list',
            choices: employees.map(emp => ({ name: emp.name, value: emp.id })),
            message: 'Which employee\'s role do you want to update?'
          },
          {
            name: 'role',
            type: 'list',
            choices: roles.map(role => ({ name: role.title, value: role.id })),
            message: 'What is the new role for this employee?'
          }
        ]);
      })
      .then(answer => {
        const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
        connection.query(query, [answer.role, answer.employee], (err, res) => {
          if (err) throw err;
          console.log('Employee role updated successfully!');
          mainMenu();
        });
      })
      .catch(err => {
        throw err;
      });
  }
  
