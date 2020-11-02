import express from "express";
import cors from "cors";

import v1 from "./v1";

const app = express();
const api = express.Router();

app.use(cors());
app.use(express.json());

api.use("/v1", v1);
app.use("/api", api);

export default app;