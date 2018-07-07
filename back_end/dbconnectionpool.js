/**
 * Singleton Class to handle database connections and queries
 **/

const mysql = require('mysql');
const config = require("./config/config.js");
var process = require('process');

/**
 * Unique instance: pool of connections
 */
var pool;


module.exports = {

    /**
     * Instantiate the singleton
     */
    init: function () {
        this.getPool();
    },

    /**
     * Static method to get the singleton database connection object
     * @returns {Pool|*}
     */
    getPool: function () {
        if (pool) return pool;

        var process = require('process');
        if(process.platform=='linux') {

            //choose the environment to work on
            if (config.data.environment == "dev") {
                pool = mysql.createPool({
                    host: config.data.db_dev.host,
                    user: config.data.db_dev.user,
                    password: config.data.db_dev.password,
                    database: config.data.db_dev.database,
                    debug: config.data.db_dev.debug
                });
            }
            else if (config.data.environment == "prod") {
                pool = mysql.createPool({
                    host: config.data.db_prod.host,
                    user: config.data.db_prod.user,
                    password: config.data.db_prod.password,
                    database: config.data.db_prod.database,
                    debug: config.data.db_prod.debug
                });
            }
            //if not, work on dev environment.
            else {
                pool = mysql.createPool({
                    host: config.data.db_dev.host,
                    user: config.data.db_dev.user,
                    password: config.data.db_dev.password,
                    database: config.data.db_dev.database,
                    debug: config.data.db_dev.debug
                });

            }
        }
        else{
                pool = mysql.createPool({
                    host: config.data.db_local.host,
                    user: config.data.db_local.user,
                    password: config.data.db_local.password,
                    database: config.data.db_local.database,
                    debug: config.data.db_local.debug
                });
        }
        return pool;
    },

    /**
     * Run a db query
     * (Wrapper method to be backward compatible with the sqlite api)
     * @param query
     * @param params
     * @param callback
     */
    run: function (query, params, callback) {
        pool.query(query, params, callback);
    },

    /**
     * Run a db query
     * (Wrapper method to be backward compatible with the sqlite api)
     * @param query
     * @param params
     * @param callback
     */
    all: function (query, params, callback) {
        pool.query(query, params, callback);
    },


    /**
     * Wrapper for database connection in transaction
     * @param query
     * @param params
     * @param callback
     */
    transactionQuery: function (query, params, callback) {


        pool.getConnection(function(err, conn) {
            if (err) {
                console.log("Error in getting the connection");
                throw err;
                return;
            }

            console.log("Begin DB transaction");
            conn.beginTransaction(function(err) {
                if (err) {
                    console.log("Transaction error: ", err);
                    console.log("release connection");
                    if (callback) {
                        arguments[0] = "Error in transaction: " + err;
                        callback.apply(arguments);
                    }

                    conn.release();
                    return;
                }

                let args = arguments;

                //in transaction query
                conn.query(query, params, function(err) {
                    var args = arguments;

                    if (err) {
                        if (err == "rollback") {
                            console.log("In transaction error: ", err, "rolling back");
                            args[0] = err = null;
                        }
                        //rolling back
                        console.log("Rolling back");
                        conn.rollback(function() {
                            console.log("Rollback completed.");
                            console.log("Release connection");
                            conn.release();

                            if (callback) {
                                callback.apply(args);
                            }
                        });
                    }

                    else {
                        conn.commit(function(err) {
                            if (err) {
                                console.log("In transaction commit error:",  err);
                                args[0] = err;
                                conn.rollback(function() {
                                    console.log("Rollback completed after error in commit.");
                                    console.log("Release connection");
                                    conn.release();
                                });
                            }
                            console.log("Transaction complete. Releasing connection");
                            args[0] = "Transaction successful";
                            if (callback) {
                                callback.apply(args);
                            }

                            conn.release();
                        });
                    }

                });

            });



        });

    },

    /**
     * Close the db connection.
     * (Wrapper method to be backward compatible with the sqlite api)
     */
    close: function() {
        //do nothing.
    }
}