const mysql = require("mysql");
const initdb = require("./db-init");
const inquirer = require("inquirer");
require("console.table");

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
            "View department, role, employee data or budget",
            "Update employee data",
            "Delete department, role or employee",
            "exit"
        ]

    }).then(async function(answer) {
        switch (answer.action) {
        case "Add department, role or employees":
            await addOptions();
            break;
        case "View department, role, employee data or budget":
            viewOptions();
            break;
        case "Update employee data":
            updateOptions();
            break;
        case "Delete department, role or employee":
            deleteOptions();
            break;
        case "exit":
            exit();
            break;
        }
    });
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
    }).then(function(answer) {
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
    });
}

async function viewOptions() {
    await inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to view?",
        choices: [
            "Departments",
            "Roles",
            "Employees",
            "Employees by Manager",
            "Department budget"
        ]
    }).then(function(answer) {
        switch (answer.action) {
        case "Departments":
            const deptQuery = "SELECT * FROM department";
            viewObject(deptQuery);
            break;
        case "Roles":
            const roleQuery = `SELECT r.id, r.title, r.salary, d.name AS department FROM role r
                LEFT JOIN department d ON r.department_id = d.id`;
            viewObject(roleQuery);
            break;
        case "Employees":
            const empQuery = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary,
                CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e
                LEFT JOIN role r ON e.role_id = r.id
                LEFT JOIN department d ON r.department_id = d.id
                LEFT JOIN employee m ON e.manager_id = m.id`;
            viewObject(empQuery);
            break;
        case "Employees by Manager":
            viewEmployeeByManager();
            break;
        case "Department budget":
            const departmentBudget = `SELECT d.id, d.name, SUM(r.salary) AS budget FROM employee e
                LEFT JOIN role r ON e.role_id = r.id
                LEFT JOIN department d ON r.department_id = d.id
                GROUP BY d.id`;
            viewObject(departmentBudget);
            break;
        }
    });
}

async function updateOptions() {
    await inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to update?",
        choices: [
            "Employee role",
            "Employee manager"
        ]
    }).then(function(answer) {
        switch (answer.action) {
        case "Employee role":
            updateEmployeeRoles();
            break;
        case "Employee manager":
            updateEmployeeManager();
            break;
        }
    });
}

async function deleteOptions() {
    await inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to delete?",
        choices: [
            "Department",
            "Employee",
            "Role"
        ]
    }).then(function(answer) {
        switch (answer.action) {
        case "Department":
            deleteDepartment();
            break;
        case "Employee":
            deleteEmployee();
            break;
        case "Role":
            deleteRole();
            break;
        }
    });
}

async function addDepartment() {
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
            console.log("Department inserted!\n");
            options();
        }
    );
}

function addRole() {
    connection.query(
        "SELECT * FROM department",
        async function(err, res) {
            if (err) throw err;
            const departmentChoices = getDepartments(res);

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

            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: role.title,
                    salary: role.salary,
                    department_id: role.departmentId
                },
                function(err, res) {
                    if (err) throw err;
                    console.log("Role created!\n");
                    options();
                }
            );
        }
    );
}

async function addEmployee() {
    connection.query(
        "SELECT * FROM employee",
        function(err, res) {
            if (err) throw err;
            const managerChoices = getEmployees(res);
            managerChoices.push({value: null, name: "None"});

            connection.query(
                "SELECT * FROM role",
                async function(err, res) {
                    if (err) throw err;
                    const roles = getRoles(res);

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
                            message: "Roles:",
                            choices: roles
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Managers:",
                            choices: managerChoices
                        }
                    ]);

                    connection.query("INSERT INTO employee SET ?",
                        {
                            first_name: employee.firstName,
                            last_name: employee.lastName,
                            role_id: employee.roleId,
                            manager_id: employee.managerId
                        },
                        function(err, res) {
                            if (err) throw err;
                            console.log("Employee inserted!\n");
                            options();
                        }
                    );
                }
            );
        }
    );
}

async function updateEmployeeRoles() {
    connection.query(
        "SELECT * FROM employee",
        function(err, res) {
            if (err) throw err;
            const employees = getEmployees(res);

            connection.query(
                "SELECT * FROM role",
                async function(err, res) {
                    if (err) throw err;
                    const roles = getRoles(res);

                    const employee = await inquirer.prompt([
                        {
                            type: "list",
                            name: "id",
                            message: "Choose an employee:",
                            choices: employees
                        }
                    ]);

                    const newRole = await inquirer.prompt([
                        {
                            type: "list",
                            name: "id",
                            meassage: "Roles:",
                            choices: roles
                        }
                    ]);

                    connection.query(
                        "UPDATE employee SET role_id = ? WHERE id = ?",
                        [newRole.id, employee.id],
                        function(err, res) {
                            if (err) throw err;
                            console.log("Employee updated!\n");
                            options();
                        }
                    );
                }
            );
        }
    );
}

function updateEmployeeManager() {
    connection.query(
        "SELECT * FROM employee",
        async function(err, res) {
            if (err) throw err;
            const employees = getEmployees(res);
            employees.push({value: null, name: "None"});


            const employee = await inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Choose an employee:",
                    choices: employees
                }
            ]);

            const newManager = await inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    meassage: "Choose the new manager:",
                    choices: employees
                }
            ]);

            connection.query(
                "UPDATE employee SET manager_id = ? WHERE id = ?",
                [newManager.id, employee.id],
                function(err, res) {
                    if (err) throw err;
                    console.log("Employee updated!\n");
                    options();
                }
            );
        }
    );
}

function viewEmployeeByManager() {
    connection.query(
        "SELECT * FROM employee",
        async function(err, res) {
            if (err) throw err;
            const managers = getEmployees(res);

            const manager = await inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Choose a manager:",
                    choices: managers
                }
            ]);

            connection.query(
                "SELECT * FROM employee WHERE manager_id = ?",
                manager.id,
                function(err, res) {
                    if (err) throw err;
                    console.table(res);
                    options();
                }
            );
        }
    );
}

function deleteDepartment() {
    connection.query(
        "SELECT * FROM department",
        async function(err, res) {
            if (err) throw err;
            const departmentChoices = getDepartments(res);

            const department = await inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Choose a department:",
                    choices: departmentChoices
                }
            ]);

            connection.query(
                "DELETE FROM department WHERE id = ?",
                department.id,
                function(err, res) {
                    if (err) errorHandlingForDelete(err);
                    else {
                        console.log("Department deleted.\n");
                        options();
                    }
                }
            );
        }
    );
}

function deleteRole() {
    connection.query(
        "SELECT * FROM role",
        async function(err, res) {
            if (err) throw err;
            const roles = getRoles(res);

            const role = await inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Choose a role:",
                    choices: roles
                }
            ]);

            connection.query(
                "DELETE FROM role WHERE id = ?",
                role.id,
                function(err, res) {
                    if (err) errorHandlingForDelete(err);
                    else {
                        console.log("Role deleted.\n");
                        options();
                    }
                }
            );
        }
    );
}

function deleteEmployee() {
    connection.query(
        "SELECT * FROM employee",
        async function(err, res) {
            if (err) throw err;
            const employees = getEmployees(res);

            const employee = await inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Choose an employee:",
                    choices: employees
                }
            ]);

            connection.query(
                "DELETE FROM employee WHERE id = ?",
                employee.id,
                function(err, res) {
                    if (err) errorHandlingForDelete(err);
                    else {
                        console.log("Employee deleted.\n");
                        options();
                    }
                }
            );
        }
    );
}

function viewObject(query) {
    connection.query(
        query,
        function(err, res) {
            if (err) throw err;
            console.table(res);
            options();
        }
    );
}

function getRoles(res) {
    const roles = [];
    for (let i = 0; i < res.length; i++) {
        roles.push({value: res[i].id, name: `${res[i].title}`});
    }
    return roles;
}

function getEmployees(res) {
    const employees = [];
    for (let i = 0; i < res.length; i++) {
        employees.push({value: res[i].id, name: `${res[i].first_name} ${res[i].last_name}`});
    }
    return employees;
}

function getDepartments(res) {
    const departmentChoices = [];
    for (let i = 0; i < res.length; i++) {
        departmentChoices.push({value: res[i].id, name: res[i].name});
    }
    return departmentChoices;
}

function errorHandlingForDelete(err) {
    if (err.errno === 1451) {
        console.log("There is a reference to this resource. You need to delete the reference first.\n");
        options();
    } else throw err;
}

function exit() {
    connection.destroy();
    console.log("\nGoodbye");
}

function start() {
    connection.connect(function(err) {
        if (err) throw err;
        options();
    });
}

initdb(start);
