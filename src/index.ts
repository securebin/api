import app from "./api";
import dotenv from "dotenv";

dotenv.config();

import "./db/mongoose";

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});