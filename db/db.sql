CREATE SCHEMA IF NOT EXISTS transportation_management
    AUTHORIZATION postgresql;

SET search_path TO transportation_management;

CREATE TABLE "Role" (
  "role_id" SERIAL  PRIMARY KEY,
  "role_name" varchar
);


CREATE TABLE "Account" (
  "acc_id" SERIAL  PRIMARY KEY,
  "username" varchar,
  "password" varchar,
  "role_id" integer,
  "refresh_token" varchar,
  "date_create_at" timestamp,
  "date_update_at" timestamp,

);

CREATE TABLE "Staff" (
  "staff_id" SERIAL  PRIMARY KEY,
  "fullname" varchar,
  "email" varchar,
  "phone" varchar,
  "warehouse_id" integer,
  "acc_id" integer
);

CREATE TABLE "Customer" (
  "cus_id" SERIAL   PRIMARY KEY,
  "fullname" varchar,
  "email" varchar,
  "phone" varchar,
  "address" integer,
  "default_address" integer,
  "status" integer,
  "acc_id" integer
);

CREATE TABLE "Address" (
  "address_id" SERIAL  PRIMARY KEY,
  "city_id" integer,
  "district_id" integer,
  "ward_id" integer,
  "house" varchar
);

CREATE TABLE "AddressBook" (
  "book_id" SERIAL  PRIMARY KEY,
  "cus_id" integer,
  "address_id" integer
);

CREATE TABLE "City" (
  "city_id" SERIAL  PRIMARY KEY,
  "city_name" varchar
);

CREATE TABLE "District" (
  "district_id" SERIAL  PRIMARY KEY,
  "city_id" integer,
  "district_name" varchar
);

CREATE TABLE "Ward" (
  "ward_id" SERIAL  PRIMARY KEY,
  "district_id" integer,
  "ward_name" varchar
);

CREATE TABLE "Warehouse" (
  "warehouse_id" SERIAL  PRIMARY KEY,
  "address_id"  integer,
  "warehouse_name" varchar
);


CREATE TABLE "WarehouseRule" (
  "rule_id" SERIAL  PRIMARY KEY,
  "warehouse_id_1" integer,
  "warehouse_id_2" integer,
  "distance" varchar
);
-- ALTER TABLE "WarehouseRule" 
-- RENAME COLUMN "rule_content" TO "ward_id";

CREATE TABLE "priceMultiplier" (
  "id" SERIAL  PRIMARY KEY,
  "maxDistance" integer,
  "multiplier" decimal(10,5)
);


CREATE TABLE "Order" (
  "order_id" SERIAL  PRIMARY KEY,
  "cus_id" integer,
  "pickup_name" varchar,
  "pickup_phone" varchar,
  "pickup_address" integer,
  "pickup_transporter" integer,
  "deliver_name" varchar,
  "deliver_phone" varchar,
  "deliver_address" integer,
  "deliver_transporter" integer,
  "order_stt" integer,
  "estimated_price" integer
);

CREATE TABLE "Price" (
  "price_id" SERIAL  PRIMARY KEY,
  "price_type" varchar,
  "price" varchar
);

CREATE TABLE "Code" (
  "code_value" varchar PRIMARY KEY,
  "order_id" integer,
  "price" varchar
);

CREATE TABLE "ActivityLog" (
  "log_id" SERIAL  PRIMARY KEY,
  "order_id" integer,
  "time" timestamp,
  "order_stt" integer
);

CREATE TABLE "Request" (
  "request_id" SERIAL  PRIMARY KEY,
  "order_id" integer,
  "request_type" integer,
  "request_stt" integer,
  "note" varchar
);

CREATE TABLE "RequestType" (
  "rt_id" SERIAL  PRIMARY KEY,
  "rt_name" varchar
);

CREATE TABLE "OrderStatus" (
  "stt_id" SERIAL  PRIMARY KEY,
  "stt_name" varchar
);

CREATE TABLE "Shift" (
  "shift_id" SERIAL  PRIMARY KEY,
  "day" date,--day work
  "shift" integer --slot in day
);

CREATE TABLE "ShiftSheet" (
  "sheet_id" SERIAL  PRIMARY KEY,
  "shift_id" integer,-- forykey for Shift
  "staff_id" integer -- employee work on
);

CREATE TABLE "PayRule" (
  "rule_id" SERIAL  PRIMARY KEY,
  "effort" integer
);


ALTER TABLE "Account" ADD FOREIGN KEY ("role_id") REFERENCES "Role"  ("role_id");

ALTER TABLE "Staff" ADD FOREIGN KEY ("acc_id") REFERENCES "Account" ("acc_id");

ALTER TABLE "Staff" ADD FOREIGN KEY ("warehouse_id") REFERENCES "Warehouse" ("warehouse_id");

ALTER TABLE "Customer"  ADD FOREIGN KEY ("acc_id") REFERENCES "Account" ("acc_id");

ALTER TABLE "AddressBook" ADD FOREIGN KEY ("cus_id") REFERENCES "Customer"  ("cus_id");

ALTER TABLE "AddressBook" ADD FOREIGN KEY ("address_id") REFERENCES "Address" ("address_id");
--
--ALTER TABLE "Address"  ADD FOREIGN KEY ("city_id") REFERENCES "City" ("city_id");
--ALTER TABLE "Address"  ADD FOREIGN KEY ("district_id") REFERENCES "District" ("district_id");
ALTER TABLE "Address"  ADD FOREIGN KEY ("ward_id") REFERENCES "Ward" ("ward_id");
--
ALTER TABLE "District" ADD FOREIGN KEY ("city_id") REFERENCES "City" ("city_id");

ALTER TABLE "Ward" ADD FOREIGN KEY ("district_id") REFERENCES "District" ("district_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("cus_id") REFERENCES "Customer" ("cus_id");
 
ALTER TABLE "Order" ADD FOREIGN KEY ("pickup_transporter") REFERENCES "Staff" ("staff_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("deliver_transporter") REFERENCES "Staff" ("staff_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("pickup_address") REFERENCES "Address" ("address_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("deliver_address") REFERENCES "Address" ("address_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("order_stt") REFERENCES "OrderStatus" ("stt_id");
-------
ALTER TABLE "ActivityLog" ADD FOREIGN KEY ("order_id") REFERENCES "Order" ("order_id");

ALTER TABLE "ActivityLog" ADD FOREIGN KEY ("order_stt") REFERENCES "OrderStatus" ("stt_id");

ALTER TABLE "Request" ADD FOREIGN KEY ("order_id") REFERENCES "Order" ("order_id");

ALTER TABLE "Request" ADD FOREIGN KEY ("request_type") REFERENCES "RequestType" ("rt_id");

ALTER TABLE "Code" ADD FOREIGN KEY ("order_id") REFERENCES "Order" ("order_id");

ALTER TABLE "Warehouse" ADD FOREIGN KEY ("address_id") REFERENCES "Address" ("address_id");

ALTER TABLE "ShiftSheet" ADD FOREIGN KEY ("shift_id") REFERENCES "Shift" ("shift_id");

ALTER TABLE "ShiftSheet" ADD FOREIGN KEY ("staff_id") REFERENCES "Staff" ("staff_id");

--inser into table Role
INSERT INTO "Role" ("role_name") VALUES
  ('customer'),--mobile
  ('shipper'),--mobile
  ('staff'),--web,mobile
  ('manager'),--web,mobile
  ('admin');--web
--insert into table "Account"
INSERT INTO "Account" ("username", "password", "role_id") VALUES
  ('admin', '$2a$10$uLiZraIbxcRihv9ru61M1uuWxyvWkdAe8OGx6wn.AhCgaLmMZhO3G', 5), 
  ('duannv2', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 2),
  ('duannv3', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 3), 
  ('duannv4', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 4),
  ('duannv5', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 1),
  ('duannv6', '$2a$10$uLiZraIbxcRihv9ru61M1uuWxyvWkdAe8OGx6wn.AhCgaLmMZhO3G', 1), 
  ('duannv7', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 1),
  ('duannv8', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 1), 
  ('duannv9', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 1),
  ('duannv10', '$2a$10$WVzSvVUeTqz2JGK0PnhLo.lzvxFkCq5zEtLdG4jpz8/o.X897CH.m', 2); 

-- Insert into "Customer"
INSERT INTO "Customer" ("fullname", "email", "phone", "default_address", "status", "acc_id") VALUES
  ('Duan Nguyen', 'duannv5@example.com', '123456789', NULL, 1, 5),
  ('Duan Nguyen', 'duannv6@example.com', '123456789', NULL, 1, 6),
  ('Duan Nguyen', 'duannv7@example.com', '123456789', NULL, 1, 7),
  ('Duan Nguyen', 'duannv8@example.com', '123456789', NULL, 1, 8),
  ('Duan Nguyen', 'duannv9@example.com', '123456789', NULL, 1, 9);

-- Insert into "Staff"
INSERT INTO "Staff" ("fullname", "email", "phone", "warehouse_id", "acc_id") VALUES
  ('Admin', 'admin@example.com', '123456789', 1, 1), 
  ('Duan Nguyen2', 'duannv2@example.com', '123456789', 2, 2),
  ('Duan Nguyen3', 'duannv3@example.com', '123456789', 3, 3),
  ('Duan Nguyen4', 'duannv4@example.com', '123456789', 4, 4),
  ('Duan Nguyen10', 'duannv10@example.com', '123456789', 5, 10);
-- Insert data into "City" table
INSERT INTO "City" ("city_name") VALUES
  ('HANOI'),
  ('HANOI'),
  ('HANOI'),
  ('HANOI'),
  ('HANOI');
-- Insert data into "District" table
INSERT INTO "District" ("city_id", "district_name") VALUES
  (1, 'District A'),
  (1, 'District B'),
  (1, 'District C'),
  (1, 'District D'),
  (1, 'District E');

-- Insert data into "Ward" table
INSERT INTO "Ward" ("district_id", "ward_name") VALUES
  (1, 'Ward 1'),
  (2, 'Ward 2'),
  (3, 'Ward 3'),
  (4, 'Ward 4'),
  (5, 'Ward 5');

INSERT INTO "Address" ("city_id", "district_id", "ward_id", "house") VALUES
  (1, 1, 1, '123 Street A'),
  (1, 2, 2, '456 Street B'),
  (1, 3, 3, '789 Street C'),
  (1, 4, 4, '101 Street D'),
  (1, 5, 5, '202 Street E');

--insert into table "Warehouse" 
INSERT INTO "Warehouse" ("address_id", "warehouse_name") VALUES
  (1, 'SUPER ADMIN'),
  (2, 'Warehouse B DD'),
  (3, 'Warehouse C HD'),
  (4, 'Warehouse D CG'),
  (5, 'Warehouse E TX');

--insert into table "WarehouseRule" 
INSERT INTO "WarehouseRule" ("warehouse_id", "ward_id") VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5);
--insert into table "Warehouse" 
INSERT INTO "Warehouse" ("address_id", "warehouse_name") VALUES
  (1, 'SUPER ADMIN'),
  (2, 'Warehouse B DD'),
  (3, 'Warehouse C HD'),
  (4, 'Warehouse D CG'),
  (5, 'Warehouse E TX');

--insert into table "WarehouseRule" 
INSERT INTO "WarehouseRule" ("warehouse_id", "ward_id") VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5);


