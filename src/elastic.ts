import { Client } from "@elastic/elasticsearch";
import * as fs from "fs";
import winston from "winston";

const PASSWORD = process.env.PASSWORD;

if (PASSWORD === undefined) {
    winston.error("Please provide env variable PASSWORD.");
    process.exit(1);
}

export const client = new Client({
    node: "https://es01:9200",
    auth: {
        username: "elastic",
        password: PASSWORD,
    },
    tls: {
        ca: fs.readFileSync("certs/ca/ca.crt"),
    }
});
