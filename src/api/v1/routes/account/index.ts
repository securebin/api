import express from "express";
import authenticate from "../../middlewares/authenticate";

const router = express.Router();

router.get("/", authenticate({ required: true }), async (req, res) => {
    const user = req.user;

    res.send({ user });
});

router.get("/email", authenticate({ required: true }), async (req, res) => {
    const user = req.user;

    res.send({
        email: await user.getEmail()
    });
});

export default router;