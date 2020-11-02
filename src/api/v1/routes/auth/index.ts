import express from "express";
import User from "../../../../models/user";
import authenticate from "../../middlewares/authenticate";
import APIError from "../../../../utils/APIError";
import { APIErrors } from "../../../../utils/Constants";

const router = express.Router();

router.post("/register", async (req, res, next) => {
    const userObject = {
        email: null,
        username: null,
        password: null
    }

    Object.assign(userObject, req.body);

    const user = new User(userObject);

    try {
        await user.save();

        const session = await user.createSession({ ip: req.ip });

        res.status(201).send({ token: session.token, user });
    } catch (error) {
        next(error);
    }
});

router.post("/login", authenticate({ required: false }), async (req, res, next) => {
    if (req.user) {
        return next(new APIError({ type: APIErrors.UNAUTHORIZED, error: "You're already authenticated" }));
    }

    try {
        const user = await User.findByCredentials(req.body.username, req.body.password);

        if (!user) throw new Error();

        const session = await user.createSession({ ip: req.ip });

        return res.send({ token: session.token, user });
    } catch (error) {
        return next(error);
    }
});

router.post("/logout", authenticate({ required: true }), async (req, res, next) => {
    try {
        await req.session.remove();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;