CREATE TABLE interviews (
   logtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   company_id VARCHAR(50) NOT NULL,
   interview_id VARCHAR(255) NOT NULL,
   interview_email VARCHAR(255) NOT NULL,
   interview_company_name VARCHAR(255) NOT NULL,
   demo_link VARCHAR(255),
   score INT,
   
   PRIMARY KEY( interview_id )
);