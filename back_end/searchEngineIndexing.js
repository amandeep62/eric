/**
 * This module is responsible of indexing data to facilitate the information retrieval in mysql.
 **/




function SearchEngineIndex(_app, _db) {
    let app;
    let db;
    this.app = _app;
    this.db = _db;

    let self = this;


    /**
     * Index for search features
     * @param callback
     */
    this.index = function(callback) {
        let self = this;
        this.indexReleaseScope(function(message, err) {
            if (err) {
                console.log("indexReleaseScope error - " + err);
                if (callback) {
                    callback("Error while indexing release_scope table.", err);
                }
            }
            else {
                self.indexReleaseSummary(function(message, err) {
                    if (err) {
                        console.log("indexReleaseSummary error - " + err);
                        if (callback) {
                            callback("Error while indexing release_summary table.", err);
                        }
                    }
                    else {
                        if (callback) {
                            callback("Indexing completed.", null);
                        }
                    }

                });

            }
        });
    }

    /**
     * Index all release_scope records in index_search table.
     * The records that have no release_theme assigned and the ones without description are ignored.
     * If a specific scope_id has already been indexed, then there is no need to do it.
     * @param callback
     */
    this.indexReleaseScope = function(callback) {
        var query = "INSERT INTO index_search (component_id, component, version_id, release_theme, body) " +
            "SELECT release_scope.scope_id, \"scope\" as component, release_scope.version_id, release_scope.release_theme, release_scope.description " +
            "FROM release_scope " +
            "WHERE release_scope.description <> \"\" " +
            "AND release_scope.release_theme <> \"\" " +
            "AND release_scope.scope_id NOT IN (SELECT component_id FROM index_search WHERE component = \"scope\")";

        this.db.all(query, function (err, rows) {
            if (err) {
                if (callback) {
                    callback("Error on query " + query, err);
                }

            } else {
                if (callback) {
                    callback("Query " + query + " successful.", err);
                }
            }
        });
        this.db.close();
    }



    /**
     * Index all release_summery records in index_search table.
     * The records that have no description are ignored.
     * If a specific summery_id has already been indexed, then there is no need to do it.
     * @param callback
     */
    this.indexReleaseSummary = function(callback) {
        var query = "INSERT INTO index_search (component_id, component, version_id, release_theme, body) " +
            "SELECT release_summery.summery_id, \"summary\" as component, release_summery.version_id, \"summary\" as release_theme, release_summery.release_features " +
            "FROM release_summery " +
            "WHERE release_summery.release_features <> \"\" " +
            "AND release_summery.summery_id NOT IN (SELECT component_id FROM index_search WHERE component = \"summary\")";

        this.db.all(query, function (err, rows) {
            if (err) {
                if (callback) {
                    callback("Error on query " + query, err);
                }

            } else {
                if (callback) {
                    callback("Query " + query + " successful.", err);
                }
            }
        });
        this.db.close();
    }

    /**
     * Search the word in the indexed table that matches the given word
     * @param matchWord word to match
     * @param callback callback function
     */
    SearchEngineIndex.prototype.searchWord = function (matchWord, callback) {
        let query = "SELECT s.component_id, s.component, v.number as \"release_number\", s.release_theme, s.body FROM index_search AS s " +
        "INNER JOIN version as v " +
        "ON s.version_id = v.version_id " +
        "WHERE MATCH (body) " + "AGAINST (\"" + matchWord + "\") " +
        "ORDER BY v.number, s.component";
        this.db.all(query, function (err, rows) {
            if (err) {
                console.log("wordSearch error - " + err);
                if (callback) {
                    callback("Match Word Error", err);
                }

            } else {
                if (!rows) {
                    rows=[];
                }
                if (callback) {
                    callback(rows, err);
                }
            }
        });
        this.db.close();
    };


}
/**
 * Init: attach a route to allow the indexing
 * @param db
 */
SearchEngineIndex.prototype.init = function (_app, _db) {
    console.log("SearchEngineIndex init()");
    let self = this;

    //Create an endpoint enabling search engine indexing
    this.app.get("/index", function (req, res) {
        self.index(function(message, err) {
            if (err) {
                console.log("err index", err);
                res.status(500).send("Indexing error: " + err);
            }
            else {
                res.status(200).send("Indexing done.");
            }

        });
    });

    //Create an endpoint enabling search engine indexing
    this.app.post("/searchWord", function (req, res) {
        let body = req.body;
        if (body && body["matchWord"]) {
            self.searchWord(body["matchWord"], function(data, err) {
                if (err) {
                    res.status(500).send("Match Search internal server error: " + err);
                }
                else {
                    let results = {
                        "matchWord": body["matchWord"],
                        "results": data
                    }

                    res.status(200).send(results);

                }
            });
        }
        else {
            res.status(401).send("No word to match");
        }
    });

};






module.exports = SearchEngineIndex;