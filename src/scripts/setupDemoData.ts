import * as fs from "fs";
import * as path from "path";
import Float32Array from "@stdlib/array-float32";
import add from "@stdlib/math-strided-ops-add";
import { XMLParser } from "fast-xml-parser";
import { SingleBar } from "cli-progress";
import winston from "winston";
import { parseFile } from "./parser";
import { client } from "../elastic";
import { loadModel } from "./doc2vec";

winston.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.cli()),
}));

type Dict = {[key: string]: {count: number; vector: Float32Array}};

const addToDict = (key: string | undefined, vector: Float32Array, dict: Dict) => {
    if (key === undefined) {
        return;
    }
    if (dict[key] === undefined) {
        dict[key] = { count: 1, vector };
    } else {
        dict[key].count++;
        add(vector.length, "float32", dict[key].vector, 1, "float32", vector, 1, "float32", dict[key].vector, 1);
    }
};

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
                    resultOneWord: { type: "keyword" },
                    timeline: { type: "object" },
                    footer: {
                        properties: {
                            date: { type: "keyword" },
                            year: { type: "keyword" },
                            month: { type: "keyword" },
                            judges: {
                                properties: {
                                    type: { type: "keyword" },
                                    name: { type: "keyword" },
                                    role: { type: "keyword" },
                                },
                            },
                        },
                    },
                    cause: { type: "keyword" },
                    personSet: { type: "keyword" },
                    referenceSet: { type: "keyword" },
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
    const causeDict: Dict = {};
    const courtSet = new Set<string>();
    const judgeSet = new Set<string>();
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
        addToDict(file.cause, new Float32Array(file.featureVector), causeDict);
        courtSet.add(file.court.name);
        file.footer?.judges?.forEach((judge) => {
            judgeSet.add(judge.name);
        });
        ++count;
    }
    bar.stop();
    await client.indices.refresh({ index: "demo-index" });

    if (await client.indices.exists({ index: "demo-cause" })) {
        await client.indices.delete({ index: "demo-cause" });
    }
    await client.indices.create({
        index: "demo-cause",
        body: {
            mappings: {
                properties: {
                    cause: { type: "keyword" },
                    featureVector: {
                        type: "dense_vector",
                        dims: 300,
                    },
                },
            },
        },
    });
    const causeEntries = Object.entries(causeDict);
    causeEntries.sort((a, b) => b[1].count - a[1].count);
    winston.info(`There are ${causeEntries.length} different causes, and the top 100 will be loaded.`);
    for (const e of causeEntries.slice(0, 100)) {
        await client.index({
            id: e[0],
            index: "demo-cause",
            document: {
                cause: e[0],
                featureVector: Array.from(e[1].vector),
            },
        });
    }
    await client.indices.refresh({ index: "demo-cause" });

    if (await client.indices.exists({ index: "demo-suggest" })) {
        await client.indices.delete({ index: "demo-suggest" });
    }
    await client.indices.create({
        index: "demo-suggest",
        body: {
            mappings: {
                properties: {
                    keyword: {
                        type: "text",
                        analyzer: "ik_max_word",
                        search_analyzer: "ik_smart",
                        fields: {
                            suggest: {
                                type: "completion",
                                analyzer: "ik_max_word",
                            },
                        },
                    },
                    type: { type: "keyword" },
                },
            },
        },
    });
    for (const cause of Object.keys(causeDict)) {
        await client.index({
            index: "demo-suggest",
            document: {
                keyword: cause,
                type: "cause",
            },
        });
    }
    winston.info("Loading court names for suggestion.");
    const courtBar = new SingleBar({});
    courtBar.start(courtSet.size, 0);
    for (const court of courtSet.keys()) {
        courtBar.increment(1);
        await client.index({
            index: "demo-suggest",
            document: {
                keyword: court,
                type: "court",
            },
        });
    }
    courtBar.stop();
    winston.info("Loading judge names for suggestion.");
    const judgeBar = new SingleBar({});
    judgeBar.start(judgeSet.size, 0);
    for (const judge of judgeSet.keys()) {
        judgeBar.increment(1);
        await client.index({
            index: "demo-suggest",
            document: {
                keyword: judge,
                type: "judge",
            },
        });
    }
    judgeBar.stop();
    await client.indices.refresh({ index: "demo-suggest" });

    winston.info(`Successfully loaded demo data. ${filesSelected.length - count} file(s) are skipped.`);
};

// eslint-disable-next-line no-console
setupDemoData().catch(console.error);
