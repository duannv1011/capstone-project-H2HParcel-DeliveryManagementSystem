
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
);

CREATE TABLE "Staff" (
  "staff_id" SERIAL  PRIMARY KEY,
  "fullname" varchar,
  "email" varchar,
  "phone" varchar,
  "warehouse_id" integer,
  "acc_id" integer,
  "address_id" integer
);
//add address_id

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
  "address_id" integer,
  "is_deleted" boolean DEFAULT false
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
  "pickup_shipper" integer,
  "deliver_name" varchar,
  "deliver_phone" varchar,
  "deliver_address" integer,
  "deliver_shipper" integer,
  "order_stt" integer,
  "estimated_price" integer
);

CREATE TABLE "Price" (
  "price_id" SERIAL  PRIMARY KEY,
  "price_type" varchar,
  "price" varchar
);

CREATE TABLE "QRCode" (
  "code_id" SERIAL  PRIMARY KEY,
  "order_id" integer,
  "code_value" varchar unique,
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
// data
CREATE TABLE "RequestType" (
  "rt_id" SERIAL  PRIMARY KEY,
  "rt_name" varchar
);
// data
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
// data
CREATE TABLE "PayRule" (
  "rule_id" SERIAL  PRIMARY KEY,
  "effort" integer,
  "pay_rule_name" varchar
);




