const supertest = require("supertest");
const app = require("../../app");
const api = supertest(app);
const pool = require("../../db/db");
const bcrypt = require("bcrypt");
const {saltLength} = require("../../config");

beforeAll(async () => {
    await pool.query("DELETE FROM users");
});

describe("Executing /api/users/register", () => {
    it("create an account", async () => {
        const res = await api.post("/api/users/register").send({
            email: "email@test.com",
            password: "password",
            username: "testuser",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("accessToken");
    });

    describe("return error if username or email is taken", () => {
        beforeAll(async () => {
            await pool.query("DELETE FROM users");
            const hashedPassword = await bcrypt.hash("secret", saltLength);
            const profileQuery = await pool.query(
                "INSERT INTO profiles(description, image_url) VALUES($1, $2) returning profiles.id",
                ["testuser description", ""]
            );
            await pool.query(
                "INSERT INTO users(username, password, email, profile_id) VALUES($1, $2, $3, $4) returning users.id",
                ["testuser", hashedPassword, "email@test.com", profileQuery.rows[0].id]
            );
        });
        it("should return error if username is taken", async () => {
            const res = await api
                .post("/api/users/register")
                .send({
                    email: "email@test.com",
                    password: "password",
                    username: "testuser",
                })
                .expect(400);

            expect(res.body).toHaveProperty("message", "The username or email is already in use.");
        });
    });
});

describe("Executing /api/users/login", () => {

    it("should login a user", async () => {
        await api.post("/api/users/register").send({
            email: "email2@test.com",
            password: "password",
            username: "testuser2",
        });

        const res = await api
            .post("/api/users/login")
            .send({email: "email2@test.com", password: "password"});

        expect(res.body).toHaveProperty("accessToken");
        expect(res.body).toHaveProperty("user");
        expect(res.statusCode).toBe(200);
    });

    it("should return error if invalid credentials is entered", async () => {
        const res = await api
            .post("/api/users/login")
            .send({email: "invalid@test.com", password: "amsdp"})

        expect(res.body).toHaveProperty("message", "User not found. Please register first.");
        expect(res.statusCode).toBe(404);
    });
});


afterAll(async () => {
    await pool.end();
});