import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../utils/snowflake";
import APIError from "../utils/APIError";
import { APIErrors } from "../utils/Constants";

export interface IPasteModel extends Model<IPasteDocument> { };

export interface IPasteDocument extends Document {
    id: string;
    title: string;
    content: string;
    keyHash: string;
    user: string;
    createdAt: Date;
    updatedAt: Date;
}

const pasteSchema = new Schema({
    id: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        default: () => snowflake.generate()
    },
    title: {
        type: Schema.Types.String,
        default: () => "Untitled paste",
        trim: true
    },
    content: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    keyHash: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    user: {
        type: Schema.Types.String
    }
}, {
    timestamps: true,
    id: false
});

pasteSchema.methods.toJSON = function () {
    const pasteDocument = this as IPasteDocument;
    const pasteObject = pasteDocument.toObject() as IPasteDocument;

    delete pasteObject.keyHash;

    return pasteObject;
}

pasteSchema.pre("validate", async function (next) {
    const document: IPasteDocument = this as IPasteDocument;

    if (document.isModified("title")) {
        const title = document.title.trim();

        if (title.length < 1 || title.length > 26) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Title must be between 1 and 26 in length" }));
        }
    }

    if (!document.content) {
        return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Content is required" }));
    }

    if (!document.keyHash) {
        return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Key hash is required" }));
    }

    if (document.isModified("keyHash")) {
        const keyHash = document.keyHash;

        if (!/^-?[0-9a-fA-F]+$/.test(keyHash) || keyHash.length != 64) {
            return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Key hash must be a valid SHA256 hash" }));
        }
    }

    next();
});

const Paste: IPasteModel = mongoose.model<IPasteDocument, IPasteModel>("Paste", pasteSchema);

export default Paste;