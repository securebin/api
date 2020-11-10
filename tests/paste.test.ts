import path from "path";
import dotenv from "dotenv";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/api";

dotenv.config({
    path: path.join(__dirname, ".env")
});

import { mongoMemoryServer } from "../src/db/mongoose";

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
    setupDatabase,
    userOneSession
} from "./fixtures/db";
import { IPasteDocument } from "../src/models/paste";

beforeAll(async (done) => {
    await setupDatabase();

    app.enable("trust proxy");

    done();
});

afterAll(async (done) => {
    await mongoose.disconnect();
    await mongoMemoryServer.stop();

    done();
});

describe("Pastes", function () {
    it("fetches all pastes", async function (done) {
        const response = await request(app)
            .get("/api/v1/pastes")
            .set("Authorization", `Bearer ${userOneSession.token}`)
            .set("X-Forwarded-For", "0.0.0.0");

        expect(response.body).toHaveProperty("pastes");

        expect(Array.isArray(response.body.pastes)).toBe(true);

        const pastes: IPasteDocument[] = response.body.pastes;

        pastes.forEach((paste) => {
            expect(paste).toHaveProperty("id");
            expect(paste).toHaveProperty("title");
            expect(paste).toHaveProperty("user");
        });

        const firstPaste = pastes[0];

        expect(firstPaste.id).toBe(pasteOne.id);
        expect(firstPaste.title).toBe(pasteOne.title);
        expect(firstPaste.user).toBe(pasteOne.user);

        done();
    });
});