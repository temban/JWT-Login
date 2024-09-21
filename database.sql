CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE DATABASE jwttutorial;

CREATE TABLE users (
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL UNIQUE,
    user_password TEXT NOT NULL
);

CREATE TABLE menu (
    menu_id SERIAL PRIMARY KEY,
    menu_name TEXT NOT NULL,
    menu_description TEXT,
    menu_price NUMERIC(10, 2) NOT NULL
);

SELECT * FROM users;
SELECT * FROM menu;

INSERT INTO users (user_name, user_email, user_password) VALUES ('Blaise', 'tem@gmail.com', '12345');
INSERT INTO menu (menu_name, menu_description, menu_price) 
VALUES 
    ('Spaghetti Bolognese', 'Traditional Italian pasta with meat sauce', 12.99),
    ('Caesar Salad', 'Crisp romaine lettuce with Caesar dressing and croutons', 8.50),
    ('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 10.75);

DROP TABLE name_of_table press ENTER
then put ; press enter
--connection to my postgres
--psql postgresql://postgres:allpha01@localhost/postgres
--\c jwttutorial
--\dt

