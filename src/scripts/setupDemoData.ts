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
    let count = 0;
    await loadModel();
    if (await client.indices.exists({ index: "demo-index" })) {
        await client.indices.delete({ index: "demo-index" });
    }
    await client.indices.create({
        index: "demo-index",
        body: {
            mappings: {
                properties: {
                    id: { type: "keyword" },
                    title: { type: "text" },
                    content: {
                        type: "text",
                        analyzer: "ik_max_word",
                        search_analyzer: "ik_smart",
                    },
                    court: {
                        properties: {
                            name: { type: "keyword" },
                            code: { type: "keyword" },
                            level: { type: "keyword" },
                            province: { type: "keyword" },
                            city: { type: "keyword" },
                        },
                    },
                    document: {
                        properties: {
                            name: { type: "keyword" },
                            type: { type: "keyword" },
                        },
                    },
                    _case: {
                        properties: {
                            name: { type: "keyword" },
                            token: { type: "keyword" },
                            type: { type: "keyword" },
                            primaryType: { type: "keyword" },
                            secondaryType: { type: "keyword" },
                            year: { type: "keyword" },
                            courtAlias: { type: "keyword" },
                            id: { type: "keyword" },
                        },
                    },
                    persons: { type: "object" },
                    record: { type: "object" },
                    detail: { type: "object" },
                    analysis: { type: "object" },
                    result: { type: "object" },
                    timeline: { type: "object" },
                    footer: { type: "object" },
                    featureVector: {
                        type: "dense_vector",
                        dims: 300,
                    },
                },
            },
        },
    });
    const files = await fs.promises.readdir("dataset");
    const limit = process.argv[2] === undefined ? files.length : Number(process.argv[2]);
    const filesSelected = files.slice(0, limit);
    const bar = new SingleBar({});
    bar.start(filesSelected.length, 0);
    for (const filename of filesSelected) {
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
        ++count;
    }
    bar.stop();
    await client.indices.refresh({ index: "demo-index" });
    winston.info(`Successfully loaded demo data. ${filesSelected.length - count} file(s) are skipped.`);
};

// eslint-disable-next-line no-console
setupDemoData().catch(console.error);
