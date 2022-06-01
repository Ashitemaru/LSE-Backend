import * as fs from "fs";
import * as path from "path";
import { XMLParser } from "fast-xml-parser";
import winston from "winston";
import { client } from "../elastic";

winston.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.cli()),
}));

const setupDemoData = async () => {
    if (await client.indices.exists({ index: "demo-index" })) {
        await client.indices.delete({ index: "demo-index" });
    }
    const files = await fs.promises.readdir("dataset");
    for (const file of files.slice(0, 10)) {
        const text = await fs.promises.readFile(path.join("dataset", file));
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "attr_",
        });
        const obj = parser.parse(text);
        const title = obj.writ.QW.WS.attr_value;
        const content = obj.writ.QW.attr_oValue;
        await client.index({
            index: "demo-index",
            document: { title, content },
        });
    }
    await client.indices.refresh({ index: "demo-index" });
};

setupDemoData().catch(winston.error);
