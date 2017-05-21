CREATE TABLE accounts (
   logtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   company_id VARCHAR(25) NOT NULL,
   company_name VARCHAR(255) NOT NULL,
   email VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL,
   is_main_account BOOLEAN NOT NULL,
   authorization_level INT NOT NULL,
   
   PRIMARY KEY( company_id )
);