import * as fs from "fs";
import * as path from "path";
import { XMLParser } from "fast-xml-parser";
import winston from "winston";
import { parseHead, parsePersons } from "./parser";
import { client } from "../elastic";

winston.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.cli()),
}));

const setupDemoData = async () => {
    if (await client.indices.exists({ index: "demo-index" })) {
        await client.indices.delete({ index: "demo-index" });
    }
    const files = await fs.promises.readdir("dataset");
    for (const file of files) {
        const text = await fs.promises.readFile(path.join("dataset", file));
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "attr_",
        });
        const { writ } = parser.parse(text);
        if (writ === undefined) {
            continue;
        }
        const { QW: { WS, DSR } } = writ;
        const id = file.replace(".xml", "");
        if (WS.JBFY === undefined) {
            // 可能是检察院
            continue;
        }
        const { title, court, document, _case } = parseHead(WS);
        const persons = parsePersons(DSR);

        await client.index({
            index: "demo-index",
            document: {
                id,
                title,
                court,
                document,
                _case,
                persons,
            },
        });
    }
    await client.indices.refresh({ index: "demo-index" });
};

setupDemoData().catch(winston.error);
