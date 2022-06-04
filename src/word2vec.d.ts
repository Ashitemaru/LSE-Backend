/* eslint-disable */
declare module "word2vec" {
    interface WordVector {
        word: string;
        values: number[];
        add: (wordVector: WordVector) => WordVector;
    }

    interface Model {
        words: string;
        size: string;
        getVector: (word: string) => WordVector;
        getVectors: (words: string[]) => WordVector[];
    }

    function loadModel (file: string, callback: (error: Error | null, model: Model) => any): void;
}
