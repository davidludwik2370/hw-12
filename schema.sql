DROP DATABASE IF EXISTS emp_trackerDB;
CREATE database emp_trackerDB;

USE emp_trackerDB;

CREATE TABLE department (
  id INT auto_increment,
  name VARCHAR(30) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT auto_increment,
  title VARCHAR(30) NULL,
  salary DECIMAL NULL,
  department_id INT NULL ,
  PRIMARY KEY (id),
  FOREIGN KEY(department_id) REFERENCES department(id) ON DELETE SET NULL
);

CREATE TABLE employee (
  id INT auto_increment,
  first_name VARCHAR(30) NULL,
  last_name VARCHAR(30) NULL,
  role_id INT NULL,
  manager_id INT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(role_id) REFERENCES role(id) ON DELETE SET NULL,
  FOREIGN KEY(manager_id) REFERENCES employee(id) ON DELETE SET NULL
);

INSERT INTO department (name) VALUES ("Sales");
INSERT INTO department (name) VALUES ("Engineering");
INSERT INTO department (name) VALUES ("Finance");
INSERT INTO department (name) VALUES ("Legal");

INSERT INTO role VALUES (1, "Sales Lead", 100000, 1);
INSERT INTO role VALUES (2, "Salesperson", 80000, 1);
INSERT INTO role VALUES (3, "Lead Engineer", 150000, 2);
INSERT INTO role VALUES (4, "Software Engineer", 120000, 2);
INSERT INTO role VALUES (5, "Accountant", 125000, 3);
INSERT INTO role VALUES (6, "Legal Team Lead", 250000, 4);
INSERT INTO role VALUES (7, "Lawyer", 190000, 4);

INSERT INTO employee VALUES (6, "Malia", "Brown", 5, null);
INSERT INTO employee VALUES (7, "Sarah", "Lourd", 6, null);
INSERT INTO employee VALUES (3, "Ashley", "Rodriguez", 3, null);
INSERT INTO employee VALUES (1, "John", "Doe", 1, 3);
INSERT INTO employee VALUES (2, "Mike", "Chan", 2, 1);
INSERT INTO employee VALUES (4, "Kevin", "Tupik", 4, 3);
INSERT INTO employee VALUES (8, "Tom", "Allen", 7, 7);
INSERT INTO employee VALUES (9, "Christian", "Eckenrode", 3, 2);



