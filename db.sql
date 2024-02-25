CREATE SCHEMA IF NOT EXISTS transportation_management
    AUTHORIZATION postgresql;

SET search_path TO transportation_management;

CREATE TABLE "Account" (
  "acc_id" SERIAL  PRIMARY KEY,
  "username" varchar,
  "password" varchar,
  "role_id" integer
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
  "default_address" integer,
  "status" integer,
  "acc_id" integer
);

CREATE TABLE "Role" (
  "role_id" SERIAL  PRIMARY KEY,
  "role_name" varchar
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
  "warehouse_name" varchar,
  "rule_id" integer,
  "cordinate" varchar
);


CREATE TABLE "WarehouseRule" (
  "rule_id" SERIAL  PRIMARY KEY,
  "warehouse_id" integer,
  "ward_id" varchar
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
  "transporter" integer -- employee work on
);

CREATE TABLE "PayRule" (
  "rule_id" SERIAL  PRIMARY KEY,
  "effort" integer
);


ALTER TABLE "Account" ADD FOREIGN KEY ("role_id") REFERENCES "Role"  ("role_id");

ALTER TABLE "Staff" ADD FOREIGN KEY ("acc_id") REFERENCES "Account" ("acc_id");

ALTER TABLE "Customer"  ADD FOREIGN KEY ("acc_id") REFERENCES "Account" ("acc_id");

ALTER TABLE "AddressBook" ADD FOREIGN KEY ("cus_id") REFERENCES "Customer"  ("cus_id");

ALTER TABLE "Customer" ADD FOREIGN KEY ("default_address") REFERENCES "AddressBook" ("book_id");

ALTER TABLE "AddressBook" ADD FOREIGN KEY ("address_id") REFERENCES "Address" ("address_id");

ALTER TABLE "Address" ADD FOREIGN KEY ("city_id") REFERENCES "City" ("city_id");

ALTER TABLE "Address" ADD FOREIGN KEY ("district_id") REFERENCES "District" ("district_id");

ALTER TABLE "Address" ADD FOREIGN KEY ("ward_id") REFERENCES "Ward" ("ward_id");

ALTER TABLE "District" ADD FOREIGN KEY ("city_id") REFERENCES "City" ("city_id");

ALTER TABLE "Ward" ADD FOREIGN KEY ("district_id") REFERENCES "District" ("district_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("cus_id") REFERENCES "Customer" ("cus_id");

ALTER TABLE "Request" ADD FOREIGN KEY ("request_id") REFERENCES "Order" ("order_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("pickup_transporter") REFERENCES "Staff" ("staff_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("deliver_transporter") REFERENCES "Staff" ("staff_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("pickup_address") REFERENCES "Address" ("address_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("deliver_address") REFERENCES "Address" ("address_id");

ALTER TABLE "Order" ADD FOREIGN KEY ("order_stt") REFERENCES "OrderStatus" ("stt_id");

ALTER TABLE "ActivityLog" ADD FOREIGN KEY ("order_id") REFERENCES "Order" ("order_id");

ALTER TABLE "ActivityLog" ADD FOREIGN KEY ("order_stt") REFERENCES "OrderStatus" ("stt_id");

ALTER TABLE "Request" ADD FOREIGN KEY ("request_type") REFERENCES "RequestType" ("rt_id");

ALTER TABLE "Code" ADD FOREIGN KEY ("order_id") REFERENCES "Order" ("order_id");

--confuse here
-- ALTER TABLE "Price" ADD FOREIGN KEY ("price_id") REFERENCES "Order" ("estimated_price");

ALTER TABLE "Warehouse" ADD FOREIGN KEY ("rule_id") REFERENCES "WarehouseRule" ("rule_id");

ALTER TABLE "Warehouse" ADD FOREIGN KEY ("address_id") REFERENCES "Address" ("address_id");

ALTER TABLE "Staff" ADD FOREIGN KEY ("warehouse_id") REFERENCES "Warehouse" ("warehouse_id");

ALTER TABLE "ShiftSheet" ADD FOREIGN KEY ("shift_id") REFERENCES "Shift" ("shift_id");

ALTER TABLE "ShiftSheet" ADD FOREIGN KEY ("transporter") REFERENCES "Staff" ("staff_id");

--inser into table Role
INSERT INTO transportation_management."Role" ("role_name") VALUES
  ('customer'),--mobile
  ('shipper'),--mobile
  ('staff'),--web,mobile
  ('manager'),--web,mobile
  ('admin');--web
--insert into table account 
INSERT INTO transportation_management."Account" ("username", "password", "role_id") VALUES
  ('duannv1', 'password1', 1), 
  ('duannv2', 'password2', 2),
  ('duannv3', 'password3', 3), 
  ('duannv4', 'password4', 4),
  ('duannv5', 'password5', 5); 
