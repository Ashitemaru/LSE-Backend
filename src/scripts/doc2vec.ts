import Float32Array from "@stdlib/array-float32";
import saxpy from "@stdlib/blas-base-saxpy";
import sdot from "@stdlib/blas-base-sdot";
import { eachLine } from "line-reader";
import { textRankExtract } from "nodejieba";
import winston from "winston";
import { SingleBar } from "cli-progress";

interface Model{
    w2v: Map<string, Float32Array>;
    size: number;
    dim: number;
}

let model: Model;

const ensureModelLoaded = () => {
    if (model === undefined) {
        throw new Error("Model is not loaded!");
    }
};

export const loadModel = async () => {
    if (model === undefined) {
        winston.info("Loading word2vec model...");
        const begin = Date.now();
        model = await new Promise<Model>((resolve, reject) => {
            const w2v = new Map<string, Float32Array>();
            let size: number;
            let dim: number;
            const bar = new SingleBar({});
            eachLine("./word2vec/sgns.wiki.bigram-char.txt", (line, last) => {
                const [word, ...data] = line.trimEnd().split(" ");
                if (data.length === 1) {
                    size = Number(word);
                    dim = Number(data[0]);
                    bar.start(size, 0);
                    return;
                }
                if (dim === undefined || size === undefined) {
                    throw new Error("Dim and/or size is undefined!");
                }
                if (data.length !== dim) {
                    throw new Error(`Expected dim ${dim} for vector of word ${word}, found ${data.length}.`);
                }
                const vector = data.map((s) => {
                    const v = Number(s);
                    if (isNaN(v)) {
                        throw new Error(`Found NaN in vector of word ${word}.`);
                    }
                    return v;
                });
                w2v.set(word, new Float32Array(vector));
                bar.increment(1);
                if (last) {
                    bar.stop();
                    if (w2v.size !== size) {
                        throw new Error(`w2v size mismatch! Expected ${size}, found ${w2v.size}`);
                    }
                    const end = Date.now();
                    winston.info(`Loading word2vec model took ${((end - begin) / 1000).toFixed(2)} seconds.`);
                    resolve({ w2v, size, dim });
                }
            }, (err) => {
                reject(err);
            });
        });
    }
};

export const doc2vec = (doc: string): number[] | undefined => {
    ensureModelLoaded();
    const keywords = textRankExtract(doc, 20);
    const result = new Float32Array(model.dim);
    let containsValidKeyword = false;
    for (const keyword of keywords) {
        const vector = model.w2v.get(keyword.word);
        if (vector !== undefined) {
            containsValidKeyword = true;
            saxpy(model.dim, keyword.weight, vector, 1,  result, 1);
        }
    }
    const l2norm = Math.sqrt(sdot(model.dim, result, 1, result, 1));
    return containsValidKeyword ? Array.from(result, (v) => v / l2norm) : undefined;
};
