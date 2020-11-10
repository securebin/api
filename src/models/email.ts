import validator from "validator";
import mongoose, { Schema, Model, Document } from "mongoose";
import { SHA256 } from "crypto-js";
import snowflake from "../utils/snowflake";
import APIError from "../utils/APIError";
import User from "./user";
import { encrypt, decrypt } from "../utils/emailEncryption";
import { APIErrors } from "../utils/Constants";

export interface IEmailModel extends Model<IEmailDocument> { };

export interface IEmailDocument extends Document {
    id: string;
    email: string;
    email_iv: string;
    email_hash: string;
    user: string;
    createdAt: Date;
    updatedAt: Date;
    decryptEmail(): string;
}

const emailSchema = new Schema({
    id: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        default: () => snowflake.generate()
    },
    email: {
        type: Schema.Types.String,
        required: true
    },
    email_iv: {
        type: Schema.Types.String,
        required: true
    },
    email_hash: {
        type: Schema.Types.String,
        required: true
    },
    user: {
        type: Schema.Types.String,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
    id: false
});

emailSchema.methods.decryptEmail = function() {
    const document = this as IEmailDocument;
    const email = decrypt(document.email, document.email_iv);

    return email;
}

emailSchema.pre("validate", async function (next) {
    const document: IEmailDocument = this as IEmailDocument;

    if (document.isModified("email")) {
        const email = document.email.trim();
        const [encrypted, iv] = encrypt(email);
        const emailHash = SHA256(email);

        if (await Email.countDocuments({ email_hash: emailHash.toString() })) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "That email is already in use" }));
        }

        if (!validator.isEmail(email)) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Invalid email" }));
        }

        if (email.length > 5000) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Email can't be longer than 5000 in length" }));
        }

        document.email = encrypted;
        document.email_iv = iv;
        document.email_hash = SHA256(email).toString();
    }

    next();
});

const Email: IEmailModel = mongoose.model<IEmailDocument, IEmailModel>("Email", emailSchema);

export default Email;