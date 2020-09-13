INSERT INTO department (name) VALUES ("Sales");
INSERT INTO department (name) VALUES ("Engineering");
INSERT INTO department (name) VALUES ("Office");

INSERT INTO role (title, salary, department_id) VALUES ("CEO", 1000, 3);
INSERT INTO role (title, salary, department_id) VALUES ("Secretary", 400, 3);
INSERT INTO role (title, salary, department_id) VALUES ("Engineer", 700, 2);
INSERT INTO role (title, salary, department_id) VALUES ("Analyst", 600, 1);
INSERT INTO role (title, salary, department_id) VALUES ("Associate", 450, 2);
INSERT INTO role (title, salary, department_id) VALUES ("Cleaner", 200, 3);

INSERT INTO employee (first_name, last_name, role_id) VALUES ("Foo", "Foo", 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Bee", "Baa", 4, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Mii", "Moo", 5, 2);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Cee", "Coo", 3, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Zaa", "Zuu", 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Loo", "Laa", 5, 4);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Kee", "Kii", 3, 4);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Suu", "Suu", 3, 4);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Noo", "Nii", 6, 1);
