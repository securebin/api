import HmacSHA512 from "crypto-js/hmac-sha512";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../utils/snowflake";
import APIError from "../utils/APIError";
import Session, { ISessionDocument } from "./session";
import { APIErrors } from "../utils/Constants";

export interface IUserModel extends Model<IUserDocument> {
    findByCredentials(username: string, password: string): Promise<IUserDocument>;
}

export interface IUserDocument extends Document {
    id: string;
    email: string;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    createSession({ ip }: { ip: string }): Promise<ISessionDocument>;
}

const userSchema = new Schema({
    id: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        default: () => snowflake.generate()
    },
    username: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: Schema.Types.String
    },
    password: {
        type: Schema.Types.String,
        required: true,
        trim: true
    }
}, {
    timestamps: true,
    id: false
});

userSchema.methods.toJSON = function () {
    const userDocument = this as IUserDocument;
    const userObject = userDocument.toObject() as IUserDocument;

    delete userObject.password;

    return userObject;
}

userSchema.statics.findByCredentials = async function (username: string, password: string) {
    if (!username || !password) {
        throw new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Wrong username or password" });
    }

    const user = await User.findOne({ username });

    if (!user || !await bcryptjs.compare(password, user.password)) {
        throw new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Wrong username or password" });
    }

    return user;
}

userSchema.methods.createSession = async function ({ ip }) {
    const user: IUserDocument = this as IUserDocument;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    const session = new Session({
        token: token,
        ipHash: HmacSHA512(ip, process.env.HMAC_IP_SECRET).toString(),
        user: user.id,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 24 * 7 * 1000)
    });

    await session.save();

    return session;
}

userSchema.pre("save", async function (next) {
    const document: IUserDocument = this as IUserDocument;

    if (document.isModified("password")) {
        document.password = await bcryptjs.hash(document.password, 12);
    }

    next();
});

userSchema.pre("validate", async function (next) {
    const document: IUserDocument = this as IUserDocument;

    if (!document.email) {
        return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Email is required" }));
    }

    if (!document.username) {
        return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Username is required" }));
    }

    if (!document.password) {
        return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Password is required" }));
    }

    if (document.isModified("email")) {
        const email = document.email.trim();

        if (await User.countDocuments({ email })) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "That email is already in use" }));
        }

        if (!validator.isEmail(email)) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Invalid email" }));
        }

        if (email.length > 254) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Email can't be longer than 254 in length" }));
        }
    }

    if (document.isModified("username")) {
        const username = document.username.trim();

        if (username.length < 3 || username.length > 16) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Username must be between 3 and 16 in length" }));
        }

        if (!/^[A-Za-z0-9-_.]{3,16}$/.test(username)) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Invalid characters found in username" }));
        }

        if (await User.countDocuments({ username })) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "That username is already in use" }));
        }
    }

    if (document.isModified("password")) {
        const password = document.password.trim();

        if (password.length < 6 || password.length > 72) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Password must be between 6 and 72 in length" }));
        }
    }

    next();
});

const User: IUserModel = mongoose.model<IUserDocument, IUserModel>("User", userSchema);

export default User;