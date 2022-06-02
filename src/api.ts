import express from "express";
import { client } from "./elastic";

const router = express.Router();

/**
 * @api {get} /api/info 获取系统基本信息
 * @apiDescription 获取系统基本信息
 * @apiName info
 * @apiGroup info
 * @apiSuccess {string} elasticName elastic 系统名称
 * @apiSuccess {string} elasticVersion elastic 系统版本
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "elasticName" : "unidy",
 *      "elasticVersion" : "8.2.2"
 *  }
 * @apiVersion 0.0.1
 */
router.get("/info", async (req, res) => {
    const info = await client.info();
    res.json({
        elasticName: info.name,
        elasticVersion: info.version.number,
    });
});

/**
 * @api {get} /api/demo/search 对 demo 数据进行标题查询
 * @apiDescription 对 demo 数据进行标题查询
 * @apiName demo-search
 * @apiGroup demo
 * @apiQuery {string} keyword 查询的关键词
 * @apiSuccess {number} time 查询耗时
 * @apiSuccess {json[]} hits 命中记录
 * @apiSuccess {string} hits.id 命中记录序号
 * @apiSuccess {string} hits.title 命中记录标题
 * @apiSuccess {string} hits.content 命中记录正文
 * @apiSuccessExample {json} Success-Response:
 *  {
 *   "time": 7,
 *   "hits": [
 *     {
 *       "id": "18697",
 *       "title": "浙江省东阳市人民法院 民事判决书 （2016）浙0783民初17571号",
 *       "content": "略"
 *     },
 *     {
 *       "id": "18969",
 *       "title": "浙江省杭州市中级人民法院 民事判决书 （2016）浙01民终5728号",
 *       "content": "略"
 *     },
 *     {
 *       "id": "18983",
 *       "title": "浙江省金华市中级人民法院 民事裁定书 （2016）浙07民终3399号",
 *       "content": "略"
 *     },
 *     {
 *       "id": "18948",
 *       "title": "江苏省盐城市中级人民法院 民事判决书 （2016）苏09民终319号",
 *       "content": "略"
 *     }
 *   ]
 * }
 * @apiVersion 0.0.1
 */
router.get("/demo/search", async (req, res) => {
    if (typeof req.query.keyword === "string") {
        if (!await client.indices.exists({ index: "demo-index" })) {
            res.status(500).json({ msg: "Demo dataset is not setup yet." });
            return;
        }
        const keyword = req.query.keyword;
        const { took, hits: { hits } } = await client.search({
            index: "demo-index",
            query: {
                match: {
                    title: keyword,
                }
            }
        });
        res.json({
            time: took,
            hits: hits.map(({ _source }) => ({
                id: (_source as any).id,
                title: (_source as any).title,
                content: (_source as any).content,
            })),
        });
    } else {
        res.status(400).json({ msg: "Query param `keyword` is required." });
    }
});

export default router;
