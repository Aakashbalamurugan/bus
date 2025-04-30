create schema if not exists bus_attendance;
use bus_attendance;

CREATE TABLE if not exists bus (
  id int NOT NULL AUTO_INCREMENT,
  bus_number varchar(255) NOT NULL,
  driver_name varchar(255) NOT NULL,
  driver_contact varchar(20) NOT NULL,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp,
  PRIMARY KEY (id),
  UNIQUE KEY bus_number (bus_number),
  CONSTRAINT bus_chk_1 CHECK ((length(bus_number) > 0)),
  CONSTRAINT bus_chk_2 CHECK ((length(driver_name) > 0))
  );

CREATE TABLE if not exists student (
  id int NOT NULL AUTO_INCREMENT,
  enrollment_number varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  parent_contact varchar(20) NOT NULL,
  bus_assigned_id int DEFAULT NULL,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp,
  PRIMARY KEY (id),
  UNIQUE KEY enrollment_number (enrollment_number),
  foreign key (bus_assigned_id) references bus(id),
  CONSTRAINT student_chk_1 CHECK ((length(enrollment_number) > 0)),
  CONSTRAINT student_chk_2 CHECK ((length(name) > 0)),
  CONSTRAINT student_chk_3 CHECK (regexp_like(parent_contact,_utf8mb4'^[0-9]{10,15}$'))
);


CREATE TABLE if not exists attendance (
  id int NOT NULL AUTO_INCREMENT,
  date date NOT NULL,
  bus_id int NOT NULL,
  student_id int NOT NULL,
  morning_status tinyint NOT NULL DEFAULT '0',
  morning_time time(6) DEFAULT NULL,
  evening_status tinyint NOT NULL DEFAULT '0',
  evening_time time(6) DEFAULT NULL,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp,
  PRIMARY KEY (id),
  UNIQUE KEY unique_attendance (date,student_id),
  CONSTRAINT attendance_chk_1 CHECK ((morning_status in (0,1))),
  CONSTRAINT attendance_chk_2 CHECK ((evening_status in (0,1)))
);
