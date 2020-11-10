import crypto from "crypto";

export const encrypt = (email: string): [string, string] => {
    const algorithm = "aes-256-ctr";
    const secret = process.env.CRYPTO_EMAIL_SECRET;
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secret, iv);
    const encrypted = Buffer.concat([cipher.update(email), cipher.final()]);

    return [encrypted.toString("hex"), iv.toString("hex")];
}

export const decrypt = (email: string, iv: string): string => {
    const algorithm = "aes-256-ctr";
    const secret = process.env.CRYPTO_EMAIL_SECRET;

    const decipher = crypto.createDecipheriv(algorithm, secret, Buffer.from(iv, "hex"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(email, "hex")), decipher.final()]);

    return decrypted.toString();
}