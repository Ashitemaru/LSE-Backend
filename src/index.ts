import express from "express";
import winston from "winston";
import expressWinston from "express-winston";
import api from "./api";
import { client } from "./elastic";
import { loadModel } from "./scripts/doc2vec";

winston.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.cli()),
}));

const app = express();
const port = 9000;

// WARNING: DO NOT USE IN PRODUCTION!
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Origin", "*");
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

client.info().then((r) => {
    winston.info(`Elastic version: ${r.version.number}`);
    loadModel().then(() => {
        app.listen(port, () => {
            winston.info(`Example app listening on http://localhost:${port}`);
        });
    }).catch((e) => {
        winston.error(`Failed to load word2vec model due to ${e}.`);
        winston.error("Exiting.");
        process.exit(1);
    });
}).catch((e) => {
    winston.error(`Failed to connect with elastic due to ${e}.`);
    winston.error("Exiting.");
    process.exit(1);
});
