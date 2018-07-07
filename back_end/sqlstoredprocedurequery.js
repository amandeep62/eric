
exports.init = function (db) {



    db.run("DROP PROCEDURE IF EXISTS `LoginAuthenticate_proc`;", function(err){
        if(err){
            console.log(err)
        }else{
            var loginAuthenticate_proc = "CREATE PROCEDURE LoginAuthenticate_proc(username VARCHAR(50), pass VARCHAR(50))\n" +
                "\tbegin\n" +
                "\tIF EXISTS (SELECT * FROM login WHERE user_name = username and password = pass) THEN\n" +
                "\t\tSELECT * FROM login WHERE user_name = username and password = password;\n" +
                "        UPDATE login SET lastLoginTimeStamp = NOW() where user_name = username;\n" +
                "    END IF;\n" +
                "    \n" +
                "    END";
            db.run(loginAuthenticate_proc, function(err){
                if(err){
                    //console.log(err)
                }else{

                }

            })
        }

    })

    var create_editProductReadiness_procedure =
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
        "END\n"

    db.run("DROP PROCEDURE IF EXISTS editProductReadiness_procedure;", function(err){
        if(err){
            console.log(err)
        }else{

            db.run(create_editProductReadiness_procedure, function(err){
                if(err){
                    //console.log(err)
                }else{

                }

            })
        }

    })


    db.run("DROP PROCEDURE IF EXISTS `editReleaseQuality_procedure`;", function(err){
        if(err){
            console.log(err)
        }else{
            var editReleaseQuality_proc = "CREATE PROCEDURE `editReleaseQuality_procedure`(`json` JSON)\n" +
                "BEGIN\n" +
                "  DECLARE `json_items` BIGINT UNSIGNED DEFAULT JSON_LENGTH(`json`);\n" +
                "  DECLARE `_index` BIGINT UNSIGNED DEFAULT 0;\n" +
                "\n" +
                "  DROP TEMPORARY TABLE IF EXISTS `jsonTemporary`;\n" +
                "  CREATE TEMPORARY TABLE IF NOT EXISTS `jsonTemporary`\n" +
                "    (releaseQuality_id BIGINT UNSIGNED NOT NULL,\n" +
                "    version_id BIGINT  NOT NULL,\n" +
                "    qualityStatus_id BIGINT UNSIGNED NOT NULL,\n" +
                "    quality_comment VARCHAR(500),\n" +
                "    scope_id BIGINT  NOT NULL,\n" +
                "    scope_comment VARCHAR(500)\n" +
                "    );\n" +
                "\n" +
                "  WHILE `_index` < `json_items` DO\n" +
                "    INSERT INTO `jsonTemporary` (releaseQuality_id,version_id,qualityStatus_id,quality_comment,scope_id,scope_comment)\n" +
                "    VALUES (JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].releaseQuality_id')),\n" +
                "    JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].version_id')),\n" +
                "    JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].qualityStatus_id')),\n" +
                "    REPLACE(JSON_UNQUOTE(JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].quality_comment'))),'<br />','\\n'),\n" +
                "    JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].scope_id')),\n" +
                "    REPLACE(JSON_UNQUOTE(JSON_EXTRACT(`json`, CONCAT('$[', `_index`, '].scope_comment'))),'<br />','\\n')\n" +
                "    );\n" +
                "    \n" +
                "    SET `_index` := `_index` + 1;\n" +
                "    \n" +
                "  END WHILE;\n" +
                "\n" +
                "\n" +
                "  UPDATE release_quality t1 \n" +
                "        INNER JOIN jsonTemporary t2 \n" +
                "             ON t1.releaseQuality_id = t2.releaseQuality_id\n" +
                "SET t1.qualityStatus_id = if(t2.qualityStatus_id =1000, NULL, t2.qualityStatus_id) ,\n" +
                " t1.quality_comment = t2.quality_comment ,\n" +
                " t1.scope_id = if(t2.scope_id =1000, NULL, t2.scope_id)  ,\n" +
                " t1.scope_comment =t2.scope_comment ;\n" +
                "  \n" +
                "  INSERT INTO `release_quality` (version_id,qualityStatus_id,quality_comment,scope_id,scope_comment)\n" +
                "  SELECT version_id, if(qualityStatus_id =1000, NULL, qualityStatus_id),quality_comment,if(scope_id =1000, NULL, scope_id),scope_comment from jsonTemporary\n" +
                "  where releaseQuality_id =0;\n" +
                "  DROP TEMPORARY TABLE IF EXISTS `jsonTemporary`;\n" +
                "END";
            db.run(editReleaseQuality_proc, function(err){
                if(err){
                    console.log(err)
                }else{

                }

            })
        }

    })


    db.run("DROP PROCEDURE IF EXISTS `releaseDashboard_procedure`;", function(err){
        if(err){
            console.log(err)
        }else{
            var editReleaseQuality_proc = "CREATE PROCEDURE `releaseDashboard_procedure`(year INT)\n" +
                "\t\t\t\t\t BEGIN\n" +
                "                   SELECT distinct v.version_id, v.name,CONCAT(CAST(v.number AS DECIMAL(4,1))) AS number,\n" +
                "                    v.date, v.type, YEAR(STR_TO_DATE(end_time, '%Y-%m-%d')) AS relyear,\n" +
                "                    release_timeschedule.phase_id,release_timeschedule.`start_time`,release_timeschedule.`end_time`,\n" +
                "                       release_timeschedule.actual_end_time,\n" +
                "                       rq.`quality_comment`,\n" +
                "                       REPLACE(rq.`quality_comment`,'<br />','\\n') as quality_comment,\n" +
                "                       if(rq.`releaseQuality_id` IS NULL, 0, rq.releaseQuality_id) as releaseQuality_id ,rq.`qualityStatus_id`,\n" +
                "                       REPLACE(rq.`scope_comment`,'<br />','\\n') as scope_comment ,\n" +
                "                       rq.`scope_id`,rq.`time_id`\n" +
                "                      FROM\n" +
                "                   release_timeschedule\n" +
                "                   JOIN (\n" +
                "                   SELECT version_id, MAX(phase_id-1) AS phase_id\n" +
                "                    FROM release_timeschedule\n" +
                "                   GROUP BY version_id\n" +
                "                    ) maxphase_id  \n" +
                "                     ON release_timeschedule.version_id = maxphase_id.version_id \n" +
                "                    AND release_timeschedule.phase_id = maxphase_id.phase_id\n" +
                "                     RIGHT OUTER JOIN version v\n" +
                "                   ON v.version_id = release_timeschedule.version_id \n" +
                "                   LEFT OUTER JOIN release_quality rq\n" +
                "                   ON release_timeschedule.version_id = rq.version_id\n" +
                "                   LEFT OUTER JOIN quality_status qs\n" +
                "                   ON rq.`qualityStatus_id` = rq.`qualityStatus_id` \n" +
                "                   WHERE v.name NOT IN('Summary','Unmapped')\n" +
                "                   AND       YEAR( STR_TO_DATE(end_time, '%Y-%m-%d') )=year\n" +
                "                   order by YEAR(STR_TO_DATE(end_time, '%Y-%m-%d')) desc;\n" +
                "END";
            db.run(editReleaseQuality_proc, function(err){
                if(err){
                    console.log(err)
                }else{

                }

            })
        }

    })


    db.run("DROP PROCEDURE IF EXISTS `releaseTimeSchedule_procedure`;", function(err){
        if(err){
            console.log(err)
        }else{
            var releaseTimeSchedule_proc = "CREATE PROCEDURE `releaseTimeSchedule_procedure`(`json` JSON,versionNum FLOAT,versionName VARCHAR(50))\n" +
                "BEGIN\n" +
                "\n" +
                "  DECLARE `json_items` BIGINT UNSIGNED DEFAULT JSON_LENGTH(`json`);\n" +
                "  DECLARE `_index` BIGINT UNSIGNED DEFAULT 0;\n" +
                "  DECLARE `_rollback` BOOL DEFAULT 0;\n" +
                "\n" +
                "  \n" +
                "  DECLARE EXIT HANDLER FOR SQLEXCEPTION\n" +
                "    BEGIN\n" +
                "        ROLLBACK;  -- rollback any changes made in the transaction\n" +
                "        RESIGNAL;  -- raise again the sql exception to the caller\n" +
                "    END;\n" +
                "  \n" +
                "  DROP TEMPORARY TABLE IF EXISTS `jsonTemporary`;\n" +
                "  CREATE TEMPORARY TABLE IF NOT EXISTS `jsonTemporary`\n" +
                "    (version_id BIGINT UNSIGNED DEFAULT NULL,\n" +
                "    start_time VARCHAR(500),\n" +
                "    end_time VARCHAR(500),\n" +
                "    actual_end_time VARCHAR(500),\n" +
                "    time_id VARCHAR(500),\n" +
                "    phase_id BIGINT UNSIGNED  NOT  NULL,\n" +
                "    phase_name VARCHAR(500),\n" +
                "    name VARCHAR(500)\n" +
                "    );\n" +
                "    \n" +
                "    SET @version_id_max := (SELECT MAX(version_id)+1 from Version);\n" +
                "    SET versionNum = ROUND(versionNum,1);\n" +
                "    SET @version_idByVersionNumber:= (SELECT version_id from Version where number = versionNum);\n" +
                "    \n" +
                "  START TRANSACTION;\n" +
                "                  WHILE `_index` < `json_items` DO\n" +
                "\t\t\t\t\t\tSET @version_id:=JSON_UNQUOTE( JSON_EXTRACT(json, CONCAT('$[', _index, '].version_id')));\n" +
                "\t\t\t\t\t\tSET @start_time:= JSON_UNQUOTE(JSON_EXTRACT(json, CONCAT('$[', _index, '].start_time')));\n" +
                "\t\t\t\t\t\tSET @end_time:= JSON_UNQUOTE(JSON_EXTRACT(json, CONCAT('$[', _index, '].end_time')));\n" +
                "\t\t\t\t\t\tSET @actual_end_time:= JSON_UNQUOTE(JSON_EXTRACT(json, CONCAT('$[', _index, '].actual_end_time')));\n" +
                "\t\t\t\t\t\tSET @time_id:= JSON_UNQUOTE(JSON_EXTRACT(json, CONCAT('$[', _index, '].time_id')));\n" +
                "                        SET @phase_id:= JSON_EXTRACT(json, CONCAT('$[', _index, '].phase_id'));\n" +
                "\t\t\t\t\t\tSET @phase_name:= JSON_UNQUOTE(JSON_UNQUOTE(JSON_EXTRACT(json, CONCAT('$[', _index, '].phase_name'))));\n" +
                "\t\t\t\t\t\tSET @name:= JSON_UNQUOTE(JSON_EXTRACT(json, CONCAT('$[', _index, '].name')));\n" +
                "\t\t\t\n" +
                "\t\t\t\t\t\tINSERT INTO jsonTemporary(phase_id,version_id,start_time,end_time,actual_end_time,time_id,phase_name,name)\n" +
                "\t\t\t\t\t\tVALUES(@phase_id,if(@version_id IS NULL, @version_idByVersionNumber, @version_id),@start_time,@end_time,if(@actual_end_time IS NULL OR @actual_end_time = 'null', '', @actual_end_time),@time_id,@phase_name,@name);\n" +
                "\t\t\t\t\t\tSET `_index` := `_index` + 1;\n" +
                "    \n" +
                "\t\t\t\t END WHILE;\n" +
                "                 \n" +
                "                  IF EXISTS(SELECT version_id from Version where number=versionNum) THEN\n" +
                "                  BEGIN\n" +
                "\t\t\t\n" +
                "\t\t\t\t\t\tUPDATE release_timeschedule t1 \n" +
                "\t\t\t\t\t\tINNER JOIN jsonTemporary t2 \n" +
                "\t\t\t\t\t\tON t1.version_id = t2.version_id\n" +
                "\t\t\t\t\t\tSET\n" +
                "\t\t\t\t\t\tt1.start_time =  t2.start_time ,\n" +
                "                        t1.end_time =  t2.end_time ,\n" +
                "\t\t\t\t\t\tt1.actual_end_time =t2.actual_end_time\n" +
                "                         WHERE t1.version_id = t2.version_id\n" +
                "                         AND t1.phase_id = t2.phase_id ;\n" +
                "                       \n" +
                "                  END;\n" +
                "                  ELSE \n" +
                "                  BEGIN\n" +
                "                    \n" +
                "\t\t\t\t\t\tINSERT INTO Version(version_id,name,number,date,type)\n" +
                "\t\t\t\t\t\tVALUES(@version_id_max,versionName,versionNum,'','dev');\n" +
                "                  \n" +
                "\t\t\t\t\t\tINSERT into release_summery(version_id,release_features)\n" +
                "\t\t\t\t\t\tVALUES(@version_id_max,'');\n" +
                "                  \n" +
                "\t\t\t\t\t\tINSERT INTO release_timeschedule (version_id,phase_id,start_time,end_time,actual_end_time)\n" +
                "\t\t\t\t\t\tSELECT @version_id_max,phase_id,start_time,end_time,actual_end_time from jsonTemporary;\n" +
                "                       \n" +
                "\n" +
                "                  END;\n" +
                "                  END IF;\n" +
                "                  \n" +
                "                 COMMIT;\n" +
                "                  \n" +
                "                  \n" +
                "END";
            db.run(releaseTimeSchedule_proc, function(err){
                if(err){
                    console.log(err)
                }else{

                }

            })
        }

    })


    var capacity_metrics = "Create TABLE IF NOT EXISTS capacity_metrics\n" +
        "(\n" +
        "version_id int,\n" +
        "hoursDataJSONString text,\n" +
        "lastTimeUpdate datetime NOT NULL default NOW(),\n" +
        "FOREIGN KEY (version_id) REFERENCES version(version_id) \n" +
        ");";

    db.run(capacity_metrics, function(err){
        if(err){
            console.log(err)
        }else{

        }

    })




}


