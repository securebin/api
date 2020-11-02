import { IUserDocument } from "../src/models/user";
import { ISessionDocument } from "../src/models/session";

declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
            session?: ISessionDocument;
            token?: string;
        }
    }
}