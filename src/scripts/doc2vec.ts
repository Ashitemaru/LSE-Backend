import { cutForSearch } from "nodejieba";
import w2v, { Model } from "word2vec";
import winston from "winston";

let model: Model;

const ensureModelLoaded = () => {
    if (model === undefined) {
        throw new Error("Model is not loaded!");
    }
};

export const loadModel = async () => {
    if (model === undefined) {
        const begin = Date.now();
        model = await new Promise<Model>((resolve, reject) => {
            w2v.loadModel("./word2vec/sgns.wiki.bigram-char.txt", (error, result) => {
                if (error === null) {
                    const end = Date.now();
                    winston.info(`Loading word2vec model took ${((end - begin) / 1000).toFixed(2)} seconds.`);
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
    }
};

export const doc2vec = (doc: string): number[] => {
    ensureModelLoaded();
    const vectors = model.getVectors(cutForSearch(doc));
    const sum = vectors.reduce((x, y) => x.add(y));
    return sum.values.map((v) => v / vectors.length);
};
