const mysql = require('mysql');
const initdb = require('./db-init');
const inquirer = require("inquirer");

initdb();

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

function addDepartment() {
    console.log("Adding new department");
}

function addRole() {
    console.log("Adding new employee");
}

function addEmployee() {
    console.log("addEmployee");
}

function viewDepartment() {
    console.log("update department");
}

function viewRole() {
    console.log("update role");
}

function viewEmployee() {
    console.log("update Employee");
}

function exit() {
    console.log("\nGoodbye");
}

options();
