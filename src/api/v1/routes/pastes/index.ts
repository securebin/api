import CryptoJS from "crypto-js/aes";
import express from "express";
import authenticate from "../../middlewares/authenticate";
import Paste from "../../../../models/paste";
import APIError from "../../../../utils/APIError";
import { APIErrors } from "../../../../utils/Constants";

const router = express.Router();

router.post("/", authenticate({ required: false }), async (req, res, next) => {
    const pasteObject = {
        title: null,
        content: null,
        keyHash: null,
        user: null
    }

    const user = req.user;

    Object.assign(pasteObject, { ...req.body, user: user?.id || null });

    try {
        const paste = new Paste(pasteObject);

        await paste.save();

        res.status(201).send({ paste });
    } catch (error) {
        return next(error);
    }
});

router.get("/", authenticate({ required: true }), async (req, res) => {
    const pastes = await Paste.find({ user: req.user.id });

    res.send({
        pastes: [...pastes].map((paste) => {
            paste = paste.toJSON();

            delete paste.content;

            return paste;
        })
    });
});

router.get("/:pasteId", async (req, res, next) => {
    const keyHash = req.query.keyHash as string;

    if (!keyHash) {
        return next(new APIError({ type: APIErrors.INVALID_FORM_BODY, error: "Key hash is required" }))
    }

    const paste = await Paste.findOne({ id: req.params.pasteId, keyHash });

    if (!paste) {
        return next(new APIError({ type: APIErrors.UNKNOWN_PASTE }));
    }

    return res.send({ paste });
});

export default router;