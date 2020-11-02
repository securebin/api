import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../utils/snowflake";

export interface ISessionModel extends Model<ISessionDocument> { };

export interface ISessionDocument extends Document {
    id: string;
    token: string;
    ipHash: string;
    user: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const sessionSchema = new Schema({
    id: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        default: () => snowflake.generate()
    },
    token: {
        type: Schema.Types.String
    },
    ipHash: {
        type: Schema.Types.String
    },
    user: {
        type: Schema.Types.String
    },
    expiresAt: {
        type: Schema.Types.Date
    }
}, {
    timestamps: true,
    id: false
});

sessionSchema.pre(/find*/, function (next) {
    const query = this as mongoose.Query<any>;

    query.where("expiresAt").gt(new Date());

    next();
});

const Session: ISessionModel = mongoose.model<ISessionDocument, ISessionModel>("Session", sessionSchema);

export default Session;