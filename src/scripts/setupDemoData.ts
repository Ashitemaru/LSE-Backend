import * as fs from "fs";
import * as path from "path";
import { XMLParser } from "fast-xml-parser";
import { SingleBar } from "cli-progress";
import winston from "winston";
import { parseFile } from "./parser";
import { client } from "../elastic";
import { loadModel } from "./doc2vec";

winston.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.cli()),
}));

const setupDemoData = async () => {
    await loadModel();
    if (await client.indices.exists({ index: "demo-index" })) {
        await client.indices.delete({ index: "demo-index" });
    }
    const files = await fs.promises.readdir("dataset");
    const bar = new SingleBar({});
    bar.start(files.length, 0);
    for (const filename of files) {
        bar.increment(1);
        const text = await fs.promises.readFile(path.join("dataset", filename));
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "attr_",
        });
        const { writ } = parser.parse(text);
        if (writ === undefined) {
            continue;
        }
        if (writ.QW.WS.JBFY === undefined) {
            // 可能是检察院
            continue;
        }
        const file = parseFile(filename, writ);
        await client.index({
            id: file.id,
            index: "demo-index",
            document: file,
        });
    }
    bar.stop();
    await client.indices.refresh({ index: "demo-index" });
};

setupDemoData().catch(winston.error);
