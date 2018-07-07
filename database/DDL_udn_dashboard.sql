# --------------------------------------------------------
#  DDL for UDN_DASHBOARD database
# --------------------------------------------------------
CREATE TABLE comment
(
  comment_id        INT AUTO_INCREMENT PRIMARY KEY,
  user_name         VARCHAR(50)                         NOT NULL,
  dailysummary_id   INT                                 NOT NULL,
  commentText       TEXT                                NOT NULL,
  commentDate       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  parent_comment_id INT                                 NULL,
  CONSTRAINT comment_ibfk_3
  FOREIGN KEY (parent_comment_id) REFERENCES comment (comment_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX dailysummary_id
  ON comment (dailysummary_id);

CREATE INDEX parent_comment_id
  ON comment (parent_comment_id);

CREATE INDEX user_name
  ON comment (user_name);

CREATE TABLE cp_account
(
  cp_account_id   INT(12) DEFAULT '0' NOT NULL    PRIMARY KEY,
  cp_account_name VARCHAR(50)         NULL,
  cp_billableDate INT(12)             NULL
);

CREATE TABLE cp_china_traffic
(
  chinaTraffic_id INT         NULL,
  chinaCpName     VARCHAR(25) NOT NULL,
  chinaSpName     VARCHAR(25) NOT NULL,
  timeStamp       INT(12)     NOT NULL,
  traffic_total   BIGINT      NULL,
  PRIMARY KEY (chinaCpName, chinaSpName, timeStamp)
);




CREATE TABLE cp_statemaster
(
  state_id    INT AUTO_INCREMENT PRIMARY KEY,
  state_name  VARCHAR(100) NOT NULL,
  state_order INT          NULL,
  CONSTRAINT state_name
  UNIQUE (state_name)
);



CREATE TABLE cp_traffic
(
  cpTraffic_id INT AUTO_INCREMENT PRIMARY KEY,
  cp_Id        INT NULL,
  sp_Id        INT NULL
);

CREATE TABLE cp_traffic_details
(
  cpTraffic_id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE customer
(
  customer_id           INT                      NOT NULL    PRIMARY KEY,
  name                  LONGTEXT                 NOT NULL,
  status                LONGTEXT                 NOT NULL,
  revenue               INT                      NOT NULL,
  salesforce_identifier TEXT                     NULL,
  region                VARCHAR(50) DEFAULT 'NA' NULL,
  opportunity_id        LONGTEXT                 NULL,
  handedOffSupport      INT                      NULL,
  TrialInProgress       INT                      NULL,
  CPBoost               INT                      NULL
);



CREATE TABLE customer_feature
(
  customer_feature_id INT NOT NULL    PRIMARY KEY,
  customer_id         INT NOT NULL,
  feature_id          INT NOT NULL,
  input_value         INT NULL,
  CONSTRAINT customer_feature_ibfk_1
  FOREIGN KEY (customer_id) REFERENCES customer (customer_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX customer_id
  ON customer_feature (customer_id);

CREATE INDEX feature_id
  ON customer_feature (feature_id);

CREATE TABLE dailysummary
(
  dailysummary_id     INT AUTO_INCREMENT PRIMARY KEY,
  version_id          INT                         NOT NULL,
  summary_date        DATE                        NOT NULL,
  summary_content     LONGTEXT                    NOT NULL,
  title               VARCHAR(600) DEFAULT ''     NOT NULL,
  user_name           VARCHAR(50) DEFAULT 'admin' NOT NULL,
  summary_contentText LONGTEXT                    NULL
);

CREATE INDEX version_id
  ON dailysummary (version_id);

ALTER TABLE comment
  ADD CONSTRAINT comment_ibfk_2
FOREIGN KEY (dailysummary_id) REFERENCES dailysummary (dailysummary_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

CREATE TABLE development
(
  development_id  INT AUTO_INCREMENT PRIMARY KEY,
  version_id      INT                       NOT NULL,
  title           VARCHAR(100)              NOT NULL,
  sequence_number INT                       NOT NULL,
  achieved        FLOAT                     NOT NULL,
  remaining       FLOAT                     NOT NULL,
  goal            FLOAT                     NOT NULL,
  chartType       VARCHAR(20) DEFAULT 'Dev' NOT NULL,
  tab_type        VARCHAR(20) DEFAULT 'dev' NULL,
  CONSTRAINT idx_Development_title
  UNIQUE (title, chartType, version_id)
);

CREATE INDEX version_id
  ON development (version_id);

CREATE TABLE development_kpi
(
  development_KPI_id INT AUTO_INCREMENT PRIMARY KEY,
  kpi_id             INT      NOT NULL,
  achieved           FLOAT    NOT NULL,
  remaining          FLOAT    NOT NULL,
  goal               FLOAT    NOT NULL,
  year               INT      NULL,
  quater             LONGTEXT NULL
);

CREATE INDEX kpi_id
  ON development_kpi (kpi_id);

CREATE TABLE faults_found
(
  fault_id    INT AUTO_INCREMENT PRIMARY KEY,
  version_id  INT NOT NULL,
  module_id   INT NOT NULL,
  fault_found INT NULL
);

CREATE INDEX module_id
  ON faults_found (module_id);

CREATE INDEX version_id
  ON faults_found (version_id);

CREATE TABLE feature
(
  feature_id INT             NOT NULL    PRIMARY KEY,
  button_id  LONGTEXT        NOT NULL,
  type       INT DEFAULT '0' NOT NULL
);

ALTER TABLE customer_feature
  ADD CONSTRAINT customer_feature_ibfk_2
FOREIGN KEY (feature_id) REFERENCES feature (feature_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

CREATE TABLE feature_version
(
  feature_version_id INT NOT NULL    PRIMARY KEY,
  version_id         INT NOT NULL,
  feature_id         INT NOT NULL,
  CONSTRAINT feature_version_ibfk_2
  FOREIGN KEY (feature_id) REFERENCES feature (feature_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX feature_id
  ON feature_version (feature_id);

CREATE INDEX version_id
  ON feature_version (version_id);

CREATE TABLE kpi_states
(
  kpi_id    INT DEFAULT '0' NOT NULL    PRIMARY KEY,
  kpi_state LONGTEXT        NULL
);

ALTER TABLE development_kpi
  ADD CONSTRAINT development_kpi_ibfk_1
FOREIGN KEY (kpi_id) REFERENCES kpi_states (kpi_id);

CREATE TABLE login
(
  user_name          VARCHAR(50)               NOT NULL    PRIMARY KEY,
  email              VARCHAR(100)              NOT NULL,
  password           VARCHAR(50)               NOT NULL,
  first_name         VARCHAR(50)               NOT NULL,
  last_name          VARCHAR(50)               NOT NULL,
  role_type          INT                       NOT NULL,
  ext                VARCHAR(5) DEFAULT '.jpg' NOT NULL,
  lastLoginTimeStamp LONGTEXT                  NULL,
  CONSTRAINT email
  UNIQUE (email)
);

ALTER TABLE comment
  ADD CONSTRAINT comment_ibfk_1
FOREIGN KEY (user_name) REFERENCES login (user_name)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

CREATE TABLE module
(
  module_id   INT      NOT NULL    PRIMARY KEY,
  module_name LONGTEXT NULL
);

ALTER TABLE faults_found
  ADD CONSTRAINT faults_found_ibfk_1
FOREIGN KEY (module_id) REFERENCES module (module_id)
  ON DELETE CASCADE;

CREATE TABLE quality_status
(
  qualityStatus_id    INT AUTO_INCREMENT PRIMARY KEY,
  qualityStatus_name  TEXT NULL,
  qualityStatus_order INT  NULL
);

CREATE TABLE release_actualenddate
(
  time_id         INT AUTO_INCREMENT PRIMARY KEY,
  version_id      INT     NOT NULL,
  actual_end_time DECIMAL NULL
);

CREATE INDEX version_id
  ON release_actualenddate (version_id);

CREATE TABLE release_phase
(
  phase_id        INT AUTO_INCREMENT PRIMARY KEY,
  phase_name      LONGTEXT NULL,
  end_time        INT      NULL,
  start_time      INT      NULL,
  phase_order     INT      NULL,
  actual_end_time INT      NULL
);

CREATE TABLE release_quality
(
  releaseQuality_id INT AUTO_INCREMENT PRIMARY KEY,
  version_id        INT      NOT NULL,
  qualityStatus_id  INT      NOT NULL,
  quality_comment   LONGTEXT NULL,
  CONSTRAINT release_quality_ibfk_2
  FOREIGN KEY (qualityStatus_id) REFERENCES quality_status (qualityStatus_id)
);

CREATE INDEX qualityStatus_id
  ON release_quality (qualityStatus_id);

CREATE INDEX version_id
  ON release_quality (version_id);

CREATE TABLE release_scope
(
  scope_id      INT AUTO_INCREMENT PRIMARY KEY,
  version_id    INT      NOT NULL,
  module_id     INT      NOT NULL,
  release_theme LONGTEXT NULL,
  capabilities  LONGTEXT NULL,
  description   LONGTEXT NULL,
  CONSTRAINT release_scope_ibfk_2
  FOREIGN KEY (module_id) REFERENCES module (module_id)
);

CREATE INDEX module_id
  ON release_scope (module_id);

CREATE INDEX version_id
  ON release_scope (version_id);

CREATE TABLE release_summery
(
  summery_id       INT AUTO_INCREMENT PRIMARY KEY,
  version_id       INT      NOT NULL,
  release_features LONGTEXT NULL
);

CREATE INDEX version_id
  ON release_summery (version_id);

CREATE TABLE release_timeschedule
(
  time_id         INT AUTO_INCREMENT PRIMARY KEY,
  version_id      INT                     NOT NULL,
  phase_id        INT                     NOT NULL,
  start_time      VARCHAR(20) DEFAULT '0' NOT NULL,
  end_time        VARCHAR(20) DEFAULT '0' NOT NULL,
  actual_end_time VARCHAR(20)             NULL,
  CONSTRAINT release_timeschedule_ibfk_2
  FOREIGN KEY (phase_id) REFERENCES release_phase (phase_id)
);

CREATE INDEX phase_id
  ON release_timeschedule (phase_id);

CREATE INDEX version_id
  ON release_timeschedule (version_id);

CREATE TABLE sp_account
(
  sp_account_id   INT DEFAULT '0' NOT NULL    PRIMARY KEY,
  sp_account_name LONGTEXT        NULL
);

CREATE TABLE status_types
(
  status_id   INT AUTO_INCREMENT PRIMARY KEY,
  status_name LONGTEXT NULL
);

CREATE TABLE traffic_cp_contribution
(
  details_sp_group                    LONGTEXT   NULL,
  details_percent_total               LONGTEXT   NULL,
  details_bytes                       BIGINT     NULL,
  details_property                    LONGTEXT   NULL,
  details_name                        LONGTEXT   NULL,
  details_sp_account                  INT(12)    NOT NULL,
  details_asset                       LONGTEXT   NULL,
  details_account                     INT(12)    NOT NULL,
  details_group                       LONGTEXT   NULL,
  details_countries_code              VARCHAR(5) NOT NULL,
  details_countries_percent_total     LONGTEXT   NULL,
  details_countries_bytes             LONGTEXT   NULL,
  details_countries_name              LONGTEXT   NULL,
  details_countries_bits_per_second   LONGTEXT   NULL,
  details_http_net_off_bytes          LONGTEXT   NULL,
  details_http_net_on_bytes           LONGTEXT   NULL,
  details_http_net_on_bps             LONGTEXT   NULL,
  details_http_net_off_bps            LONGTEXT   NULL,
  details_https_net_off_bytes         LONGTEXT   NULL,
  details_https_net_on_bytes          LONGTEXT   NULL,
  details_https_net_on_bps            LONGTEXT   NULL,
  details_https_net_off_bps           LONGTEXT   NULL,
  details_detail_percent_of_entity    LONGTEXT   NULL,
  details_detail_bytes                BIGINT     NULL,
  details_detail_percent_of_timestamp LONGTEXT   NULL,
  details_detail_bits_per_second      BIGINT     NULL,
  details_detail_timestamp            INT(12)    NOT NULL,
  cp_account_billable_date            INT(12)    NULL,
  china_data                          INT(12)    NULL,
  PRIMARY KEY (details_account, details_detail_timestamp, details_countries_code, details_sp_account)
);

CREATE TABLE trafficdata
(
  details_name             LONGTEXT        NULL,
  details_detail_bytes     INT             NULL,
  details_detail_timestamp INT             NULL,
  china_data               INT DEFAULT '1' NULL
);

CREATE TABLE upload_process_link
(
  id       INT AUTO_INCREMENT PRIMARY KEY,
  file_url LONGTEXT NULL
);

CREATE TABLE version
(
  version_id INT      NOT NULL    PRIMARY KEY,
  name       LONGTEXT NOT NULL,
  number     DOUBLE   NOT NULL,
  date       LONGTEXT NOT NULL,
  type       LONGTEXT NOT NULL
);

ALTER TABLE dailysummary
  ADD CONSTRAINT dailysummary_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id);

ALTER TABLE development
  ADD CONSTRAINT development_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE faults_found
  ADD CONSTRAINT faults_found_ibfk_2
FOREIGN KEY (version_id) REFERENCES version (version_id)
  ON DELETE CASCADE;

ALTER TABLE feature_version
  ADD CONSTRAINT feature_version_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE release_actualenddate
  ADD CONSTRAINT release_actualenddate_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id);

ALTER TABLE release_quality
  ADD CONSTRAINT release_quality_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id);

ALTER TABLE release_scope
  ADD CONSTRAINT release_scope_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id);

ALTER TABLE release_summery
  ADD CONSTRAINT release_summery_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id);

ALTER TABLE release_timeschedule
  ADD CONSTRAINT release_timeschedule_ibfk_1
FOREIGN KEY (version_id) REFERENCES version (version_id);

