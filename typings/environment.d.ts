declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
             * The port that the express server will listen to
             */
            PORT: string;

            /**
             * The connection string for the MongoDB server
             */
            MONGODB_URI: string;

            /**
             * The secret for encrypting emails in the database
             */
            CRYPTO_EMAIL_SECRET: string;

            /**
             * The secret used for signing JWT tokens
             */
            JWT_SECRET: string;

            /**
             * The secret for hashing IP's in the database
             */
            HMAC_IP_SECRET: string;
        }
    }
}

export { }