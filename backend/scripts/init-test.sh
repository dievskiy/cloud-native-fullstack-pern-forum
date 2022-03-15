#!/usr/bin/env bash
echo -n "Initializing database..."
psql "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB?sslmode=disable" <<-EOSQL

CREATE USER test with password 'password';
GRANT CONNECT ON DATABASE test TO test;
GRANT pg_read_all_data TO test;
GRANT pg_write_all_data TO test;

CREATE TABLE profiles (
  "id" SERIAL PRIMARY KEY,
  "description" varchar(255),
  "image_url" varchar(3000)
);

CREATE TABLE sections (
  "name" varchar(30) PRIMARY KEY NOT NULL
);

CREATE TABLE users (
  "id" SERIAL PRIMARY KEY,
  "username" varchar(255) NOT NULL UNIQUE,
  "created_at" timestamp not null default CURRENT_TIMESTAMP,
  "profile_id" int NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password" varchar(128) NOT NULL,
  "is_admin" boolean DEFAULT false NOT NULL,
  FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);

CREATE TABLE posts (
  "id" SERIAL PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "created_at" timestamp not null default CURRENT_TIMESTAMP,
  "preview_text" varchar(200) NOT NULL,
  "content" varchar(15000) NOT NULL,
  "author" int NOT NULL,
  "image_url" varchar(3000),
  "section" varchar(30) NOT NULL,
  FOREIGN KEY ("section") REFERENCES "sections" ("name"),
  FOREIGN KEY ("author") REFERENCES "users" ("id")
);

CREATE TABLE scores (
  "user_id" int NOT NULL,
  "post_id" int NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
  FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE
);

CREATE TABLE comments(
  "id" SERIAL PRIMARY KEY,
  "user_id" int NOT NULL,
  "post_id" int NOT NULL,
  "is_edited" bool default (false) NOT NULL,
  "created_at" timestamp not null default CURRENT_TIMESTAMP,
  "related_to" int,
  "content" varchar(400) NOT NULL,
  FOREIGN KEY ("related_to") REFERENCES "comments" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
  FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE
);

CREATE INDEX "users_idx" ON "users" ("email");
CREATE INDEX "comments_idx" ON "comments" ("id", "related_to");
EOSQL