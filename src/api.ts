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
 * @apiSuccess {number} count 命中记录总数
 * @apiSuccess {json[]} hits 命中记录
 * @apiSuccess {string} hits.id 序号
 * @apiSuccess {string} hits.id 标题
 * @apiSuccess {json} hits.court 法院信息
 * @apiSuccess {json} hits.document 文书信息
 * @apiSuccess {json} hits._case 案件信息
 * @apiSuccess {json} hits.persons 当事人信息
 * @apiSuccessExample {json} Success-Response:
 *  {
 *   "time": 6,
 *   "count": 4,
 *   "hits": [
 *     {
 *       "id": "18697",
 *       "title": "浙江省东阳市人民法院 民事判决书 （2016）浙0783民初17571号",
 *       "court": {
 *         "name": "浙江省东阳市人民法院",
 *         "code": "B84",
 *         "level": "基层",
 *         "province": "浙江",
 *         "city": "金华市"
 *       },
 *       "document": {
 *         "name": "民事判决书",
 *         "type": "判决书"
 *       },
 *       "_case": {
 *         "name": "（2016）浙0783民初17571号",
 *         "token": "民初字",
 *         "type": "民事一审案件",
 *         "primaryType": "民事案件",
 *         "secondaryType": "一审案件",
 *         "year": "2016",
 *         "courtAlias": "浙0783",
 *         "id": "17571"
 *       },
 *       "persons": {
 *         "prosecutors": [
 *           {
 *             "name": "韦斌姬",
 *             "role": "起诉方",
 *             "status": "原告",
 *             "type": "自然人",
 *             "gender": "女",
 *             "ethnicity": "汉族",
 *             "birthday": "1972年9月22日",
 *             "location": "东阳市",
 *             "nationality": "中国",
 *             "category": "原告",
 *             "identity": "其他"
 *           }
 *         ],
 *         "defendants": [
 *           {
 *             "name": "韦斌强",
 *             "role": "应诉方",
 *             "status": "被告",
 *             "type": "自然人",
 *             "gender": "男",
 *             "ethnicity": "汉族",
 *             "birthday": "1969年6月17日",
 *             "location": "东阳市",
 *             "nationality": "中国",
 *             "category": "被告",
 *             "identity": "其他"
 *           },
 *           {
 *             "name": "杜满萍",
 *             "role": "应诉方",
 *             "status": "被告",
 *             "type": "自然人",
 *             "gender": "女",
 *             "ethnicity": "汉族",
 *             "birthday": "1968年11月25日",
 *             "location": "东阳市",
 *             "nationality": "中国",
 *             "category": "被告",
 *             "identity": "其他"
 *           }
 *         ],
 *         "representatives": [
 *           {
 *             "name": "陈菊华",
 *             "role": "代理人",
 *             "status": "委托代理人",
 *             "type": "自然人",
 *             "nationality": "中国",
 *             "category": "代理人",
 *             "identity": "其他",
 *             "objects": [
 *               "韦斌强",
 *               "杜满萍"
 *             ],
 *             "representationType": "委托代理",
 *             "representativeOccupation": "非法务人员",
 *             "representativeType": "法院许可的其他公民"
 *           },
 *           {
 *             "name": "贾凌珂",
 *             "role": "代理人",
 *             "status": "委托代理人",
 *             "type": "自然人",
 *             "nationality": "中国",
 *             "category": "代理人",
 *             "identity": "其他",
 *             "objects": [
 *               "韦斌强",
 *               "杜满萍"
 *             ],
 *             "representationType": "委托代理",
 *             "representativeOccupation": "非法务人员",
 *             "representativeType": "法院许可的其他公民"
 *           }
 *         ],
 *         "joinder": true
 *       }
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
            count: hits.length,
            hits: hits.slice(0, 20).map(({ _source }) => _source),
        });
    } else {
        res.status(400).json({ msg: "Query param `keyword` is required." });
    }
});

export default router;
