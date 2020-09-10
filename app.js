const mysql = require('mysql');
const initdb = require('./db-init');
const inquirer = require("inquirer");

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

async function updateEmployeeRoles() {
    console.log("update employee roles");
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
                viewDepartment();
                break;
            case "Role":
                viewRole();
                break;
            case "Employee":
                viewEmployee();
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
    ]);

    connection.query("INSERT INTO employee SET ?",
        {
            first_name: employee.firstName,
            last_name: employee.lastName,
            role_id : 1,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " employee inserted!\n");
            options();
        }
    );
}

function viewDepartment() {
    console.log("view department");
}

function viewRole() {
    console.log("view role");
}

function viewEmployee() {
    console.log("update Employee");
}

function exit() {
    connection.destroy();
    console.log("\nGoodbye");
}

connection.connect(function(err) {
    if (err) throw err;
    options();
});
