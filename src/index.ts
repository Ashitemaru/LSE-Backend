import express from "express";
import winston from "winston";
import { ValidationError } from "express-validation";
import expressWinston from "express-winston";
import api from "./api";
import { client } from "./elastic";

winston.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.cli()),
}));

const app = express();
const port = 9000;

// WARNING: DO NOT USE IN PRODUCTION!
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin","*");
    next();
});

app.use(expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.cli()),
    expressFormat: true,
    colorize: true,
}));

app.use(express.json());

app.use("/api", api);

// @ts-ignore
app.use(function (err, req, res, next) {
    if (err instanceof ValidationError && err.details.body !== undefined) {
        return res.status(err.statusCode).json({ msg: err.details.body[0].message });
    }

    return res.status(500).json({ msg: "未知错误" });
});

client.info().then((r) => {
    winston.info(`Elastic version: ${r.version.number}`);
    app.listen(port, () => {
        winston.info(`Example app listening on http://localhost:${port}`);
    });
}).catch((e) => {
    winston.error(`Failed to connect with elastic due to ${e}.`);
    winston.error("Exiting.");
    process.exit(1);
});
