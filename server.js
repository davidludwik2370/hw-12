const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'your_new_password',
  database: 'emp_trackerDB',
});

//get___ functions return array of relevant data for use in inquirer prompts
const getTitles = () => {
  //returning a promise ensures
  return new Promise((resolve, reject) => {
    let titles = [];
    connection.query(
      `select title from role`,
      (err, res) => {
        if (err) reject();
        
        res.forEach(role => titles.push(role.title));

        resolve(titles)
      }
    );
  })
}

const getEmployees = () => {
  return new Promise((resolve, reject) => {
    let emps = [];
    connection.query(
      `select first_name from employee`,
      (err, res) => {
        if (err) reject();
        
        res.forEach(emp => emps.push(emp.first_name));
        emps.push('null');

        resolve(emps);
      }
    );
  })
}

const getDepartments = () => {
  return new Promise((resolve, reject) => {
    let depts = [];
    connection.query(
      `select name from department`,
      (err, res) => {
        if (err) reject();
        
        res.forEach(dept => depts.push(dept.name));

        resolve(depts);
      }
    );
  })
}

//display___ functions print chart of relevant data to console
const displayEmployees = () => {
  connection.query(
      `select empData.id, empData.first_name, empData.last_name, empData.title, empData.department, empData.salary, employee.first_name as manager
      from(
        select employee.id, employee.first_name, employee.last_name, roleData.title, roleData.name as department, roleData.salary, employee.manager_id
        from employee
        join(
          select role.title, role.salary, department.name, role.id
          from role
          join department
          on role.department_id = department.id)as roleData
        on employee.role_id = roleData.id) as empData
      left join employee
      on empData.manager_id = employee.id;`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      next();
    }
  )
};

const displayRoles = () => {
  connection.query(
      `select role.id, role.title, role.salary, department.name as department
      from role
      join department
      on role.department_id = department.id;`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      next();
    }
  );
};

const displayDepartments = () => {
  connection.query(
      `select * from department`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      next();
    }
  );
};

//add___ functions add an entry into the relevant database, informed by info object
const addDepartment = (info) => {
  const query = connection.query(
    `INSERT INTO department (name) VALUES ("${info.name}");`,
    (err, res) => {
      if (err) throw err;
      else{
        console.log("Department added");
        next();
      } 
    }
  );
};

const addRole = (info) => {
  connection.query(
    `select id from department where name="${info.deptName}"`,
    (err, res) => {
      if (err) throw err;
      else{
        let id = res[0].id
        connection.query(
          `INSERT INTO role (title, salary, department_id) VALUES ("${info.title}","${info.salary}","${id}");`,
          (err, res) => {
            if (err) throw err;
            else{
              console.log("Role added");
              next();
            } 
          }
        );
      } 
    }
  );
};

const addEmployee = (info) => {
  connection.query(
    `select id from role where title="${info.title}"`,
    (err, res) => {
      if (err) throw err;
      else{
        let role_id = res[0].id;
        connection.query(
          `select id from employee where first_name="${info.manager_first}"`,
          (err, res) => {
            if (err) throw err;
            else{
              let manager_id = res[0].id;
              connection.query(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                VALUES ("${info.first_name}","${info.last_name}","${role_id}","${manager_id}");`,
                (err, res) => {
                  if (err) throw err;
                  else {
                    console.log("Employee added");
                    next();
                  }
                }
              );
            } 
          }
        );
      } 
    }
  );
};

//updates the role of the selected employee to selected role, informed by info object
const updateRole = (info) => {
  connection.query(
    `select id from role where title="${info.title}"`,
    (err, res) => {
      if (err) throw err;
      else{
        let role_id = res[0].id;
        console.log(role_id)
        connection.query(
          `update employee set role_id =${role_id} where first_name="${info.first_name}"`,
          (err, res) => {
            if (err) throw err;
            else{
              console.log('Employee role changed');
              next();
            } 
          }
        );
      } 
    }
  );
};

//handles the inquirer prompts and launches relevant functions
const next = () =>{
  inquirer
  .prompt([
      {
      type: 'list',
      message: 'What would you like to do?',
      name: 'action',
      choices: ['View Employees','View Roles','View Departments','Add Employee','Add Role','Add Department','Update Role']
      },
  ])
  .then((res) => {
    //nested promises ensure access to data when necessary
    getTitles().then((titles)=>{
      getEmployees().then((emps)=>{
        getDepartments().then((depts)=>{
          if(res.action == 'View Employees'){displayEmployees();}
          else if (res.action == 'View Roles'){displayRoles();}
          else if (res.action == 'View Departments'){displayDepartments();}
          else if(res.action === 'Add Employee'){
            inquirer.prompt([
              {
              type: 'input',
              message: 'First Name: ',
              name: 'first_name',
              },
              {
              type: 'input',
              message: 'Last Name: ',
              name: 'last_name',
              },
              {
              type: 'list',
              message: 'Select Role: ',
              name: 'title',
              choices: titles,
              }, 
              {
              type: 'list',
              message: 'Select manager: ',
              name: 'manager_first',
              choices: emps,
              },       
            ])
            .then((res) => {addEmployee(res);})
          }
          else if(res.action === 'Add Role'){
            inquirer.prompt([
              {
              type: 'list',
              message: 'Department: ',
              name: 'deptName',
              choices: depts,
              },
              {
              type: 'input',
              message: 'Title: ',
              name: 'title',
              },
              {
              type: 'input',
              message: 'Salary $: ',
              name: 'salary',
              },    
            ])
            .then((res) => {addRole(res);})
          }
          else if(res.action === 'Add Department'){
            inquirer.prompt([
              {
              type: 'input',
              message: 'Name of department: ',
              name: 'name',
              }  
            ])
            .then((res) => {addDepartment(res);})
          }
          else if(res.action === 'Update Role'){
            inquirer.prompt([
              {
              type: 'list',
              message: 'Employee: ',
              name: 'first_name',
              choices: emps,
              },
              {
              type: 'list',
              message: 'New Role: ',
              name: 'title',
              choices: titles,
              }, 
            ])
            .then((res) => {updateRole(res);})
          }
        });
      });
    });
  })
}

// Connect to the DB
connection.connect((err) => {
    if (err) throw err;
    next();
});
