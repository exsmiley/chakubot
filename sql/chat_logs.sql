CREATE TABLE chat_logs (
   logtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   company_id VARCHAR(50) NOT NULL,
   interview_id VARCHAR(25) NOT NULL,
   log_index INT NOT NULL,
   message VARCHAR(255) NOT NULL,
   question_id INT NOT NULL,
   from_client BOOLEAN NOT NULL,
   score INT,
   
   PRIMARY KEY( company_id, interview_id, log_index )
);