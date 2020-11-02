import path from "path";
import dotenv from "dotenv";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/api";
import { APIErrors } from "../src/utils/Constants";

dotenv.config({
    path: path.join(__dirname, ".env")
});

import "../src/db/mongoose";

import {
    pasteOneKey,
    pasteOneKeyHash,
    pasteOneContent,
    pasteOneContentEncrypted,
    pasteOne,
    pasteTwoKey,
    pasteTwoKeyHash,
    pasteTwoContent,
    pasteTwoContentEncrypted,
    pasteTwo,
    pasteThreeKey,
    pasteThreeKeyHash,
    pasteThreeContent,
    pasteThreeContentEncrypted,
    pasteThree,
    userOne,
    userOnePassword,
    userOneSession,
    userTwo,
    userTwoPassword,
    userTwoSession,
    setupDatabase
} from "./fixtures/db";

beforeAll(async (done) => {
    await setupDatabase();

    app.enable("trust proxy");

    done();
});

afterAll(async (done) => {
    await mongoose.disconnect();

    done();
});

describe("Authentication & Authorization", function () {
    it("authorizes", async function (done) {
        const response = await request(app)
            .get("/api/v1/account")
            .set("Authorization", `Bearer ${userOneSession.token}`)
            .set("X-Forwarded-For", "0.0.0.0");

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty("user");

        const { user } = response.body;

        if (!user) {
            throw new Error("User is missing in response");
        }

        expect(user).toHaveProperty("_id");
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("username");

        expect(user._id).toBe(userOne._id.toString());
        expect(user.id).toBe(userOne.id);
        expect(user.username).toBe(userOne.username);

        done();
    });

    it("doesn't authorize", async function (done) {
        const response = await request(app)
            .get("/api/v1/account")
            .set("X-Forwarded-For", "0.0.0.0");

        expect(response.status).toBe(401);

        const error = response.body;

        expect(error.code).toBe(APIErrors.UNAUTHENTICATED.code);

        done();
    });

    it("deauthorizes", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${userOneSession.token}`)
            .set("X-Forwarded-For", "0.0.0.0");

        expect(response.status).toBe(204);

        done();
    });

    it("authenticates", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                username: userOne.username,
                password: userOnePassword
            });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");

        done();
    });

    it("gives error because of invalid username", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                username: "invalidUsername235234",
                password: userOnePassword
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);

        done();
    });

    it("gives error because of invalid password", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                username: userOne.username,
                password: "invalidPassword234498"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);

        done();
    });
});

describe("Account creation", function () {
    it("creates an account", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "sampleemail1@example.com",
                username: "sample_uname",
                password: "samplepassword"
            });

        expect(response.status).toBe(201);

        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");

        done();
    });

    it("gives error because of missing email", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "sample_uname2",
                password: "samplepassword"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("error");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);
        expect(response.body.error).toContain("Email is required");

        done();
    });

    it("gives error because of missing username", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "sampleemail1@example.com",
                password: "samplepassword"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("error");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);
        expect(response.body.error).toContain("Username is required");

        done();
    });

    it("gives error because of missing password", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "sample_uname2",
                email: "sampleemail1@example.com"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("error");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);
        expect(response.body.error).toContain("Password is required");

        done();
    });

    it("gives error because of used email", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "sampleemail1@example.com",
                username: "sample_uname2",
                password: "samplepassword"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("error");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);
        expect(response.body.error).toContain("That email is already in use");

        done();
    });

    it("gives error because of invalid email", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "sampleemail2",
                username: "sample_uname!",
                password: "samplepassword"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("error");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);
        expect(response.body.error).toContain("Invalid email");

        done();
    });

    it("gives error because of used username", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "sampleemail2@example.com",
                username: "sample_uname",
                password: "samplepassword"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("error");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);
        expect(response.body.error).toContain("That username is already in use");

        done();
    });

    it("gives error because of invalid username", async function (done) {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "sampleemail3@example.com",
                username: "sample_uname!",
                password: "samplepassword"
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("error");

        expect(response.body.code).toBe(APIErrors.INVALID_FORM_BODY.code);
        expect(response.body.error).toContain("Invalid characters found in username");

        done();
    });
});