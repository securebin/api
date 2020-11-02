import jwt from "jsonwebtoken";
import HmacSHA512 from "crypto-js/hmac-sha512";
import { NextFunction, Request, Response } from "express";
import User from "../../../models/user";
import Session from "../../../models/session";
import APIError from "../../../utils/APIError";
import { APIErrors } from "../../../utils/Constants";

const authenticate = ({ required }: { required: boolean }) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // We fetch the token from Authorization header, and replace "Bearer " with nothing
            const token = req.header("Authorization")?.replace(/^Bearer /, "");

            // If there was no token, meaning that no header was provided
            if (!token) {
                throw new APIError({ type: APIErrors.UNAUTHENTICATED });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

            // If there was a token provided, but it's not a valid one (It was either not a JWT at all, or it was signed with an invalid key)
            if (!decoded) {
                throw new APIError({ type: APIErrors.UNAUTHENTICATED });
            }

            const session = await Session.findOne({ token });

            // If the token was completely valid, but there was no document in the database
            // This only happens if there was a document before, and it's been deleted since
            if (!session) {
                throw new APIError({ type: APIErrors.UNAUTHENTICATED, error: "Your session has expired" });
            }

            const hashedIP = HmacSHA512(req.ip, process.env.HMAC_IP_SECRET).toString();

            // We restrict sessions to IP's, to prevent stolen tokens to be used
            if (session.ipHash !== hashedIP) {
                await session.remove();
                throw new APIError({ type: APIErrors.RESOURCE_DELETED, error: "For security reasons, your session was invalidated" });
            }

            const user = await User.findOne({ id: session.user });

            // If the token was valid, and a session could be associated, but the user was not found.
            // This can happen if a user is removed from the database
            if (!user) {
                throw new APIError({ type: APIErrors.RESOURCE_DELETED, error: "Your account was not found" });
            }

            req.user = user;
            req.session = session;
            req.token = token;

            next();
        } catch (error) {
            if (!(error instanceof APIError)) {
                error = new APIError({ type: APIErrors.UNAUTHENTICATED })
            }

            if (required) {
                return next(error);
            }

            next();
        }
    }
}

export default authenticate;