import express from "express";
import APIError from "../../utils/APIError";
import { APIErrors } from "../../utils/Constants";

import account from "./routes/account";
import auth from "./routes/auth";
import pastes from "./routes/pastes";

const router = express.Router();

router.use("/account", account);
router.use("/auth", auth);
router.use("/pastes", pastes);

router.use((error: APIError, req, res, next) => {
    if (!(error instanceof APIError)) {
        console.log("Got unknown error:", error);
        error = new APIError({ type: APIErrors.UNKNOWN_ERROR });
    }

    const err = error.error;
    const code = error.type.code;
    const httpStatus = error.type.httpStatus;

    res.status(httpStatus).send({
        code: code,
        error: err
    });
});

export default router;