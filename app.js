const mysql = require('mysql');
const initdb = require('./db-init');
const inquirer = require("inquirer");
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "employee_catalog"
});

async function options() {
    await inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "Add department, role or employees",
            "View department, role or employees",
            "Update employee roles",
            "exit"
        ]

    }).then(async function (answer) {
        switch (answer.action) {
            case "Add department, role or employees":
                await addOptions();
                break;
            case "View department, role or employees":
                viewOptions();
                break;
            case "Update employee roles":
                updateEmployeeRoles();
                break;
            case "exit":
                exit();
                break;
        }
    })
}

async function addOptions() {
    await inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to add?",
        choices: [
            "Department",
            "Role",
            "Employee"
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case "Department":
                addDepartment();
                break;
            case "Role":
                addRole();
                break;
            case "Employee":
                addEmployee();
                break;
        }
    })
}

async function viewOptions() {
    await inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to view?",
        choices: [
            "Department",
            "Role",
            "Employee"
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case "Department":
                const deptQuery = `SELECT * FROM department`;
                viewObject(deptQuery);
                break;
            case "Role":
                const roleQuery = `SELECT r.id, r.title, r.salary, d.name AS department FROM role r
                LEFT JOIN department d ON r.department_id = d.id`;
                viewObject(roleQuery);
                break;
            case "Employee":
                const empQuery = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e
                LEFT JOIN role r ON e.role_id = r.id
                LEFT JOIN department d ON r.department_id = d.id
                LEFT JOIN employee m ON e.manager_id = m.id`;
                viewObject(empQuery);
                break;
        }
    })
}

async function addDepartment() {
    console.log("Adding new department");
    const department = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Enter department name:"
        }
    ]);

    connection.query("INSERT INTO department SET ?",
        {
            name: department.name,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " dept inserted!\n");
            options();
        }
    );
}

function addRole() {
    connection.query(
        "SELECT * FROM department",
        async function (err, res) {
            if (err) throw err;
            const departmentChoices = [];
            for (let i = 0; i < res.length; i++) {
                departmentChoices.push({value: res[i].id, name: res[i].name});
            }

            const role = await inquirer.prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter role's title:"
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Salary:"
                },
                {
                    type: "list",
                    name: "departmentId",
                    message: "Department:",
                    choices: departmentChoices
                }
            ]);
            console.log(role);

            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: role.title,
                    salary: role.salary,
                    department_id: role.departmentId
                },
                function(err, res) {
                    if (err) throw err;
                    console.log("Role created!");
                    options();
                }
            );
        }
    );
}

async function addEmployee() {
    console.log("addEmployee");
    connection.query(
        "SELECT * FROM employee",
        function (err, res) {
            if (err) throw err;
            const managerChoices = [{value: null, name: 'None'}];
            for (let i = 0; i < res.length; i++) {
                managerChoices.push({value: res[i].id, name: `${res[i].first_name} ${res[i].last_name}`});
            }
            connection.query(
                "SELECT * FROM role",
                async function (err, res) {
                    if (err) throw err;
                    const roles = [];
                    for (let i = 0; i < res.length; i++) {
                        roles.push({value: res[i].id, name: res[i].title});
                    }

                    const employee = await inquirer.prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "First name:"
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "Last name:"
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "Role:",
                            choices: roles
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Manager:",
                            choices: managerChoices
                        }
                    ]);

                    connection.query("INSERT INTO employee SET ?",
                        {
                            first_name: employee.firstName,
                            last_name: employee.lastName,
                            role_id : employee.roleId,
                            manager_id: employee.managerId
                        },
                        function(err, res) {
                            if (err) throw err;
                            console.log(res.affectedRows + " employee inserted!\n");
                            options();
                        }
                    );
                }
            );
        }
    );
}

async function updateEmployeeRoles() {
    console.log("update employee roles");
    connection.query(
        "SELECT * FROM employee",
        function (err, res) {
            if (err) throw err;
            const employees = [];
            for (let i = 0; i < res.length; i++) {
                employees.push({value: res[i].id, name: `${res[i].first_name} ${res[i].last_name}`});
            }

            connection.query(
                "SELECT * FROM role",
                async function (err, res) {
                    if (err) throw err;
                    const roles = [];
                    for (let i = 0; i < res.length; i++) {
                        roles.push({value: res[i].id, name: res[i].title});
                    }

                const employee = await inquirer.prompt([
                    {
                    type: "list",
                    name: "id",
                    message: "choose employee:",
                    choices: employees
                    }
                ]);

                const newRole = await inquirer.prompt([
                    {
                        type: "list",
                        name: "id",
                        meassage: "roles",
                        choices: roles
                    }
                ])

                connection.query(
                    "UPDATE employee SET role_id = ? WHERE id = ?",
                    [newRole.id, employee.id],
                    function(err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + " employee updated!\n");
                        options();
                    }
                    );
                }
            );
        }
    );
}

function viewObject(query) {
    connection.query(
        query,
        function (err, res) {
            if (err) throw err;
            console.table(res);
            options();
        }
    );
}

function exit() {
    connection.destroy();
    console.log("\nGoodbye");
}

connection.connect(function(err) {
    if (err) throw err;
    options();
});

// SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e
// LEFT JOIN role r ON e.role_id = r.id
// LEFT JOIN department d ON r.department_id = d.id
// LEFT JOIN employee m ON e.manager_id = m.id
