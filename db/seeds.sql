-- Inserting sample data into 'department table
INSERT INTO department (name) VALUES
('Engineering'),
('Human Resources'),
('Marketing'),
('Sales');

-- Inserting sample data into the 'role' table
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 70000, 1),
('Senior Software Engineer', 90000, 1),
('HR Manager', 60000, 2),
('Recruiter', 45000, 2),
('Marketing Coordinator', 50000, 3),
('Sales Representative', 55000, 4);

-- Inserting sample data into the 'employee' table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, NULL),
('Emily', 'Johnson', 3, NULL),
('Michael', 'Brown', 4, 3),
('David', 'Miller', 5, NULL),
('Sarah', 'Wilson', 6, NULL);
