/**
 * Created by shashikant on 5/4/17.
 */

exports.init = function (db) {

    db.run('ALTER TABLE customer ADD COLUMN opportunity_id text', function (err) {
        if (err) {
            //console.log(err);
        }
    });


    db.run('ALTER TABLE customer ADD COLUMN handedOffSupport Integer', function (err) {
        if (err) {
            //console.log(err);
        }
    });


    db.run('ALTER TABLE customer ADD COLUMN TrialInProgress Integer', function (err) {
        if (err) {
            //console.log(err);
        }
    });


    db.run('ALTER TABLE customer ADD COLUMN CPBoost Integer', function (err) {
        if (err) {
            //console.log(err);
        }
    });

    db.run('ALTER TABLE customer ADD COLUMN region text DEFAULT "NA" ', function (err) {
        if (err) {
            //console.log(err);
        }
    });

    db.run('ALTER TABLE development ADD COLUMN tab_type text DEFAULT "dev" ', function (err) {
        if (err) {
            //console.log(err);
        } else {
            console.log("created type column");
        }
    });

    db.run('ALTER TABLE customer DROP COLUMN cp_status', function (err) {
        if (!err) {
            db.run('ALTER TABLE customer ADD COLUMN cp_status text DEFAULT "others"', function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("table added");
                }
            });
        }
    });

    var queryCreateReleasePhase = "Create table IF NOT EXISTS release_phase(\
        phase_id INTEGER PRIMARY KEY AUTOINCREMENT,\
        phase_name TEXT )";

    var queryCreateReleaseModule = "Create table IF NOT EXISTS module(\
        module_id INTEGER PRIMARY KEY,\
        module_name TEXT )";

    var queryCreateReleaseScope = "Create table IF NOT EXISTS release_scope(\
        scope_id INTEGER PRIMARY KEY AUTOINCREMENT ,\
        version_id INTEGER NOT NULL,\
        module_id INTEGER NOT NULL,\
        release_theme TEXT,\
        capabilities TEXT,\
        description TEXT,\
        Foreign key (version_id) references version(version_id),\
        Foreign key (module_id) references module(module_id)\
        )";
    //  var queryAlterReleaseTimeSchedule = 'Alter Table IF NOT EXISTS release_timeschedule ADD actual_end_time numeric';
    var queryAlterReleaseTimeSchedule = 'Alter Table release_timeschedule ADD actual_end_time numeric';

    var queryCreateReleaseTimeSchedule = "Create table IF NOT EXISTS release_timeschedule(\
        time_id INTEGER PRIMARY KEY AUTOINCREMENT ,\
        version_id INTEGER NOT NULL,\
        phase_id INTEGER NOT NULL,\
        start_time numeric NOT NULL default 0,\
        end_time numeric NOT NULL default 0,\
        Foreign key (version_id) references version(version_id),\
        Foreign key (phase_id) references release_phase(phase_id)\
        )";

    var queryCreatRelaaseActualEndDate = "Create table IF NOT EXISTS release_actualenddate(\
        time_id INTEGER PRIMARY KEY AUTOINCREMENT ,\
        version_id INTEGER NOT NULL,\
        actual_end_time numeric,\
        Foreign key (version_id) references version(version_id)\
    )";

    var queryCreateModuleFault = "Create table IF NOT EXISTS faults_found(\
        fault_id INTEGER PRIMARY KEY AUTOINCREMENT ,\
        version_id INTEGER NOT NULL, \
        module_id INTEGER NOT NULL, \
        fault_found numeric,\
        Foreign key (version_id) references version(version_id)\
        Foreign key (module_id) references version(module_id)\
    )";

    var queryCreateStatusType = "Create table IF NOT EXISTS status_types(\
    status_id  INTEGER PRIMARY KEY AUTOINCREMENT ,\
    status_name TEXT     \
    )";


    var querySpAccount = "Create table IF NOT EXISTS sp_account(\
    sp_account_id  INTEGER PRIMARY KEY,\
    sp_account_name TEXT \
    )";

    var queryCpAccount = "Create table IF NOT EXISTS cp_account(\
    cp_account_id  INTEGER PRIMARY KEY,\
    cp_account_name TEXT, \
    cp_billableDate numeric\
    )";

    var queryCpTraffic = "Create table IF NOT EXISTS cp_traffic(\
    cpTraffic_id  INTEGER PRIMARY KEY AUTOINCREMENT ,\
    cp_Id integer, \
    sp_Id integer\
    )";


    var queryCpTrafficDetails = "Create table IF NOT EXISTS cp_traffic_details(\
    cpTraffic_id  INTEGER PRIMARY KEY AUTOINCREMENT \
    )";


    db.run(querySpAccount, function (err) {
        if (err) {
            console.log(err);
        } else {

        }
    });

    db.run(queryCpAccount, function (err) {
        if (err) {
            console.log(err);
        } else {

        }
    });

    db.run(queryCpTraffic, function (err) {
        if (err) {
            console.log(err);
        } else {

        }
    });

    db.run(queryCpTrafficDetails, function (err) {
        if (err) {
            console.log(err);
        } else {

        }
    });

    db.run(queryCreateStatusType, function (err) {
        if (err) {
            console.log(err);
        } else {

        }
    });

    db.run(queryCreateModuleFault, function (err) {
        if (err) {
            console.log(err);
        }
    });

    db.run(queryCreatRelaaseActualEndDate, function (err) {
        if (err) {
            console.log(err);
        }
    })

    db.run(queryCreateReleaseModule, function (err) {
        if (!err) {
            db.run(queryCreateReleaseScope, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            console.log(err);
        }
    });

    db.run(queryCreateReleasePhase, function (err) {
        if (!err) {
            db.run(queryCreateReleaseTimeSchedule, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    })



    db.run("INSERT OR IGNORE INTO version (version_id,name,number, date) VALUES(0,'Summary',0000,'No feature')", function (err) {
        if (err) {
            console.log(err)
        } else {
        }
    });

    db.run("DROP TABLE IF EXISTS sp_statemaster ", function (err) {
        if (err) {
            console.log(err)
        }
        else {

        }
    });


    db.run("Alter table release_phase add end_time numeric", function(err){
        if(err){

        }
    });

    db.run("Alter table release_phase add start_time numeric", function(err){
        if(err){
            
        }
    });
    db.run("Alter table release_phase add phase_order numeric", function(err){
        if(err){
            
        }else{
            db.run("Update release_phase  set phase_order=1 where phase_id = 1", function(err){
        if(err){
            
        }
    });
    db.run("Update release_phase  set phase_order=2 where phase_id = 2", function(err){
        if(err){
            
        }
    });
    db.run("Update release_phase  set phase_order=3 where phase_id = 3", function(err){
        if(err){
            
        }
    });
    db.run("Update release_phase  set phase_order=4 where phase_id = 4", function(err){
        if(err){
            
        }
    });
    
    db.run("Update release_phase  set phase_order=6 where phase_id = 5", function(err){
        if(err){
            
        }
    });
    
    db.run("Update release_phase  set phase_order=7 where phase_id = 6", function(err){
        if(err){
            
        }
    });



    db.run("INSERT INTO release_phase(phase_name,phase_order) \
            SELECT 'Pre-deployment meeting with Operations', 5 \
            WHERE NOT EXISTS\
                (SELECT 1 FROM release_phase \
                WHERE phase_name = 'Pre-deployment meeting with Operations'\
                )", function(err){
        if(err){
            
        }
    });
        }
    });
    db.run("Alter table release_phase add end_time numeric", function(err){
        if(err){
            
        }
    });
    db.run("Alter table release_phase add actual_end_time numeric", function(err){
        if(err){
            
        }
    });

    

    var createSummery = "Create table IF NOT EXISTS release_summery(\
        summery_id INTEGER PRIMARY KEY AUTOINCREMENT,\
        version_id INTEGER NOT NULL,\
        release_features TEXT,\
        Foreign key (version_id) references version(version_id)\
    )";
    db.run(createSummery, function (err) {
        if (err) {
            console.log(err);
        }
    });


    var createQualityStatus = "Create table If not EXISTS quality_status(\
        qualityStatus_id INTEGER PRIMARY KEY AUTOINCREMENT,\
        qualityStatus_name TEXT,\
        qualityStatus_order INTEGER\
    )"
    db.run(createQualityStatus, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            var insertQuery1 = 'INSERT INTO quality_status (qualityStatus_name,qualityStatus_order) \
                               SELECT "COMMITMENT",0 WHERE NOT EXISTS(SELECT 1 FROM quality_status WHERE qualityStatus_name = "COMMITMENT")';
            
            var insertQuery2 = 'INSERT INTO quality_status (qualityStatus_name,qualityStatus_order) \
                               SELECT "ROBUST",1 WHERE NOT EXISTS(SELECT 1 FROM quality_status WHERE qualityStatus_name = "ROBUST")';
            
            var insertQuery3 = 'INSERT INTO quality_status (qualityStatus_name,qualityStatus_order) \
                               SELECT "WARNING",2 WHERE NOT EXISTS(SELECT 1 FROM quality_status WHERE qualityStatus_name = "WARNING")';

            var insertQuery4 = 'INSERT INTO quality_status (qualityStatus_name,qualityStatus_order) \
                               SELECT "OFF-TRACK",3 WHERE NOT EXISTS(SELECT 1 FROM quality_status WHERE qualityStatus_name = "OFF-TRACK")';

            
            var arrayInsert = [insertQuery1, insertQuery2, insertQuery3, insertQuery4];

            arrayInsert.map(function (query) {
                db.run(query, function (err) {
                    if (err) {
                        console.log(err)
                    }
                })
            })
        }
    });
    var queryProcessPdf = "Create table IF NOT EXISTS upload_process_link(\
    id  INTEGER PRIMARY KEY AUTOINCREMENT ,\
    file_url text\
    )";
    db.run(queryProcessPdf, function (err) {
        if (err) {
            console.log(err);
        } else {

        }
    });

    var createReleaseQuality = "Create table IF NOT EXISTS release_quality(\
        releaseQuality_id INTEGER PRIMARY KEY AUTOINCREMENT ,\
        version_id INTEGER NOT NULL,\
        qualityStatus_id INTEGER NOT NULL,\
        quality_comment TEXT,\
        Foreign key (version_id) references version(version_id),\
        Foreign key (qualityStatus_id) references quality_status(qualityStatus_id)\
        )";

    db.run(createReleaseQuality, function(err){
        if(err){
            console.log(err)
        }else{

        }

    })




    var loginAuthenticate_proc = "DROP PROCEDURE IF EXISTS `LoginAuthenticate_proc`;\n" +
        "\tdelimiter //\n" +
        "    CREATE PROCEDURE LoginAuthenticate_proc(username VARCHAR(50), pass VARCHAR(50))\n" +
        "\tbegin\n" +
        "\tIF EXISTS (SELECT * FROM Login WHERE user_name = username and password = pass) THEN\n" +
        "\t\tSELECT * FROM Login WHERE user_name = username and password = password;\n" +
        "        UPDATE Login SET lastLoginTimeStamp = NOW() where user_name = username;\n" +
        "    END IF;\n" +
        "    \n" +
        "    END //\n" +
        "\tdelimiter ;";

    db.run(loginAuthenticate_proc, function(err){
        if(err){
            console.log(err)
        }else{

        }

    })


    var create_editProductReadiness_procedure = "DROP PROCEDURE IF EXISTS `editProductReadiness_procedure`;\n" +
        "delimiter //\n" +
        "CREATE PROCEDURE `editProductReadiness_procedure`(`json` JSON)\n" +
        "BEGIN\n" +
        "  DECLARE `json_items` BIGINT UNSIGNED DEFAULT JSON_LENGTH(`json`);\n" +
        "  DECLARE `_index` BIGINT UNSIGNED DEFAULT 0;\n" +
        "\n" +
        "  DROP TEMPORARY TABLE IF EXISTS `jsonTemporary`;\n" +
        "\n" +
        "  CREATE TEMPORARY TABLE IF NOT EXISTS `jsonTemporary`\n" +
        "    (`id` BIGINT UNSIGNED NOT NULL,\n" +
        "    target_quarter BIGINT UNSIGNED NOT NULL,\n" +
        "    current_quarter BIGINT UNSIGNED NOT NULL,\n" +
        "    next_quarter BIGINT UNSIGNED NOT NULL,\n" +
        "    upcoming_quarter BIGINT UNSIGNED NOT NULL\n" +
        "    );\n" +
        "\n" +
        "  WHILE `_index` < `json_items` DO\n" +
        "    INSERT INTO `jsonTemporary` (`id`,target_quarter,current_quarter,next_quarter,upcoming_quarter)\n" +
        "    VALUES (JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].id')),\n" +
        "    JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].target_quarter')),\n" +
        "    JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].current_quarter')),\n" +
        "    JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].next_quarter')),\n" +
        "    JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].upcoming_quarter'))\n" +
        "    );\n" +
        "    \n" +
        "    SET `_index` := `_index` + 1;\n" +
        "    \n" +
        "  END WHILE;\n" +
        "\n" +
        "  \n" +
        "  UPDATE product_readiness t1 \n" +
        "        INNER JOIN jsonTemporary t2 \n" +
        "             ON t1.id = t2.id\n" +
        "SET t1.target_quarter = t2.target_quarter ,\n" +
        " t1.current_quarter = t2.current_quarter ,\n" +
        " t1.next_quarter = t2.next_quarter ,\n" +
        " t1.upcoming_quarter =t2.upcoming_quarter ;\n" +
        "  \n" +
        "  DROP TEMPORARY TABLE IF EXISTS `jsonTemporary`;\n" +
        "END//\n" +
        "delimiter ;";

    db.run(create_editProductReadiness_procedure, function(err){
        if(err){
            console.log(err)
        }else{

        }

    })

}


