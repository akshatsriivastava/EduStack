CREATE TABLE IF NOT EXISTS "courselist" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"level" varchar NOT NULL,
	"courseOutput" json NOT NULL,
	"createdBy" varchar NOT NULL,
	"username" varchar,
	"userProfileImage" varchar
);
