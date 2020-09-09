var mysql = require('mysql');
const fs = require("fs");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    multipleStatements: true
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    fs.readFile("seed.sql", "utf8", (err, data) => {
        if (err) throw err;

        connection.query(data, function (err, result) {
            if (err) throw err;
            console.log("Database initialized");
            connection.destroy();
        });
    })
});
