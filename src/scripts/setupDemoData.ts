import * as fs from "fs";
import * as path from "path";
import { XMLParser } from "fast-xml-parser";
import winston from "winston";
import { parseAnalysis, parseDetail, parseFooter, parseHead, parsePersons, parseRecord, parseResult } from "./parser";
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
        const { QW: { WS, DSR, SSJL, AJJBQK, CPFXGC, PJJG, WW } } = writ;
        const id = file.replace(".xml", "");
        if (WS.JBFY === undefined) {
            // 可能是检察院
            continue;
        }
        const { title, court, document, _case } = parseHead(WS);
        const persons = parsePersons(DSR);
        const record = parseRecord(SSJL);
        const detail = parseDetail(AJJBQK);
        const analysis = parseAnalysis(CPFXGC);
        const result = parseResult(PJJG);
        const footer = parseFooter(WW);

        await client.index({
            id,
            index: "demo-index",
            document: {
                id,
                title,
                court,
                document,
                _case,
                persons,
                record,
                detail,
                analysis,
                result,
                footer,
            },
        });
    }
    await client.indices.refresh({ index: "demo-index" });
};

setupDemoData().catch(winston.error);
