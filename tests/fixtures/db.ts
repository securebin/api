import jwt from "jsonwebtoken";
import { SHA256, AES, HmacSHA512 } from "crypto-js";
import User from "../../src/models/user";
import Paste from "../../src/models/paste";
import Session from "../../src/models/session";

const userOnePassword = "tMh^d4ZVS29K7kJMGDmFPPgkAg^RQhtLjNF9U2gEu5V$tR8tVnET4f3oWMc3xf$M";

const userOne = new User({
    username: "sample",
    password: userOnePassword,
    email: "sample@example.com"
});

const userOneSession = new Session({
    token: jwt.sign({ id: userOne.id }, process.env.JWT_SECRET),
    ipHash: HmacSHA512("0.0.0.0", process.env.HMAC_IP_SECRET).toString(),
    user: userOne.id,
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 24 * 7)
});

const userTwoPassword = "t4$kV32a2#tfMAvofssCoe9i@JTCLL%KajWEKap5Wj3J^CuA9MQtDzhtUo83owyD";

const userTwo = new User({
    username: "sample2",
    password: userTwoPassword,
    email: "sample2@example.com"
});

const userTwoSession = new Session({
    token: jwt.sign({ id: userTwo.id }, process.env.JWT_SECRET),
    ipHash: HmacSHA512("0.0.0.0", process.env.HMAC_IP_SECRET).toString(),
    user: userTwo.id,
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 24 * 7)
});

const pasteOneKey = "2zth47YPNgRgBEzko3NrWsZiHFDtqtWP28pT9LGrCD2emcL9GytjnCYHvngj8ZNc";
const pasteOneKeyHash = SHA256(pasteOneKey).toString();
const pasteOneContent = "This is some raw, unencrypted data";
const pasteOneContentEncrypted = AES.encrypt(pasteOneContent, pasteOneKey);

const pasteOne = new Paste({
    title: "Custom Paste Title",
    content: pasteOneContentEncrypted,
    keyHash: pasteOneKeyHash,
    user: userOne.id
});

const pasteTwoKey = "Xm8y3saNFf3mtRfLAHRQmNGZCdFoNF33LuQBcXh3kVeb28XgffL79cCSwkJ8BEKR";
const pasteTwoKeyHash = SHA256(pasteTwoKey).toString();
const pasteTwoContent = "This is another sample of some unencrypted data";
const pasteTwoContentEncrypted = AES.encrypt(pasteTwoContent, pasteTwoKey);

const pasteTwo = new Paste({
    content: pasteTwoContentEncrypted,
    keyHash: pasteTwoKeyHash,
    user: userOne.id
});

const pasteThreeKey = "Xm8y3saNFf3mtRfLAHRQmNGZCdFoNF33LuQBcXh3kVeb28XgffL79cCSwkJ8BEKR";
const pasteThreeKeyHash = SHA256(pasteThreeKey).toString();
const pasteThreeContent = "This is another sample of some unencrypted data";
const pasteThreeContentEncrypted = AES.encrypt(pasteThreeContent, pasteThreeKey);

const pasteThree = new Paste({
    content: pasteThreeContentEncrypted,
    keyHash: pasteThreeKeyHash,
    user: userTwo.id
});

const setupDatabase = async () => {
    await User.deleteMany({});
    await userOne.save();
    await userTwo.save();

    await Paste.deleteMany({});
    await pasteOne.save();
    await pasteTwo.save();
    await pasteThree.save();

    await Session.deleteMany({});
    await userOneSession.save();
}

export {
    pasteOneKey,
    pasteOneKeyHash,
    pasteOneContent,
    pasteOneContentEncrypted,
    pasteOne,
    pasteTwoKey,
    pasteTwoKeyHash,
    pasteTwoContent,
    pasteTwoContentEncrypted,
    pasteTwo,
    pasteThreeKey,
    pasteThreeKeyHash,
    pasteThreeContent,
    pasteThreeContentEncrypted,
    pasteThree,
    userOne,
    userOnePassword,
    userOneSession,
    userTwo,
    userTwoPassword,
    userTwoSession,
    setupDatabase
}