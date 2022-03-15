# Cloud-native Full-stack PERN webapp
This projects represents a full-stack cloud-native web application built on PERN (Postgres, Express, React, Node) stack. The app functionality is close to reddit's or HackerNews's - it includes creating & scoring posts, writing comments and modifying user profile. This project is generated with projen and contains backend, frontend and CDK stack in one repo.

![](https://imgur.com/GSgYO1w.png)

## Features
* Login / Sign up
* Post CRUD
* Profile settings
* Post scoring

## Deploy to the AWS
Deployment to the AWS is done through CDK on Typescript. ```src/main.ts``` contains all resources created to the stack. The most important are:
* App runner which runs the backend and scales automatically
* CodeBuild that builds React app
* Cloudfront with S3 bucket which host React app

To start deploying, prepare postgres database and put uri in .env along with other variables. After that, simply execute ```cdk bootstrap``` and ```cdk deploy``` in the root directory (note that app runner is supported only in some regions).
As a result, you should see Cloudfront distribution url:

![](https://imgur.com/D1Upaqc.png)

## Run locally
### Run backend
Fill in .env files in root and /backend using .env.example files and execute following command from root:
```shell
docker-compose -f backend/docker-compose.yml up -d --build
```
[Optional] If you want images to work, create an S3 bucket and add needed params to .env file. AWS user should have access to that bucket.

If you want to run tests:
```shell
cd backend; chmod +x scripts/test.sh; scripts/test.sh
```

### Run frontend
```shell
cd frontend; npm i; npm run start
```

To run tests:
```shell
npm run test
```

## Description
Frontend is implemented with React and Bootstrap. Backend uses Postgres and ExpressJS and follows REST architecture guidelines. Swagger could be found [here](https://app.swaggerhub.com/apis/web234/web2/1.0.0).
<details>
<summary>Database scheme</summary>

```sql
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
CREATE INDEX "comments_related_idx" ON "comments" ("id", "related_to");
CREATE INDEX "comments_user_id_idx" ON "comments" ("id", "user_id");
```

</details>

### Project structure:
```tree -L 1```
```
.
├── LICENSE
├── README.md
├── backend       # everything related to Express
├── cdk.json
├── config.js
├── frontend      # everything related to React
├── lambda        # lambda which starts react build during deployment
├── src           # CDK Stack
├── tsconfig.json
├── package.json
...
```

## Todos
This app is obviously far from perfect, the most critical parts to my understanding are:
- [ ] lack of RDS construct in CDK template
- [ ] CDK tests
- [ ] backend should be built e.g through CodeBuild, currently it uses prebuilt image on ECR
- [ ] more tests for backend & frontend 