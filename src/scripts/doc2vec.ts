import { eachLine } from "line-reader";
import { cutForSearch } from "nodejieba";
import winston from "winston";

interface Model{
    w2v: Map<string, number[]>;
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
            const w2v = new Map<string, number[]>();
            let size: number;
            let dim: number;
            eachLine("./word2vec/sgns.wiki.bigram-char.txt", (line, last) => {
                const [word, ...data] = line.trimEnd().split(" ");
                if (data.length === 1) {
                    size = Number(word);
                    dim = Number(data[0]);
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
                w2v.set(word, vector);
                if (last) {
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
    const vectors: number[][] = cutForSearch(doc)
        .map((word) => model.w2v.get(word))
        .filter((v) => v !== undefined) as number[][];
    if (vectors.length === 0) {
        return undefined;
    }
    const result = new Array(model.dim).fill(0);
    for (const vector of vectors) {
        for (let i = 0; i < model.dim; i++) {
            result[i] += vector[i];
        }
    }
    return result.map((v) => v / vectors.length);
};
