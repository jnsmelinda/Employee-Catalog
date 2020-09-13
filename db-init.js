const mysql = require("mysql");
const fs = require("fs");

function initdb(callback) {
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        multipleStatements: true
    });

    connection.connect(function(err) {
        if (err) throw err;
        fs.readFile("schema.sql", "utf8", (err, data) => {
            if (err) throw err;

            connection.query(data, function(err, result) {
                if (err) throw err;
                connection.query("SELECT COUNT(*) AS size FROM department LIMIT 1", function(err, result) {
                    if (err) throw err;
                    if (result[0].size === 0) {
                        fs.readFile("seed.sql", "utf8", (err, data) => {
                            if (err) throw err;

                            connection.query(data, function(err, result) {
                                if (err) throw err;
                                console.log("Data populated");
                                connection.destroy();
                                callback();
                            });
                        });
                    } else {
                        connection.destroy();
                        callback();
                    }
                });
            });
        });
    });
}

module.exports = initdb;
