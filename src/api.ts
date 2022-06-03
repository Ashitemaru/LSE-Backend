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
 * @apiSuccess {string} hits.title 标题
 * @apiSuccess {json} hits.court 法院信息
 * @apiSuccess {json} hits.document 文书信息
 * @apiSuccess {json} hits._case 案件信息
 * @apiSuccess {json} hits.persons 当事人信息
 * @apiSuccess {json} hits.record 诉讼记录
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
 *             "description": "原告：韦斌姬，女，1972年9月22日出生，汉族，住东阳市。",
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
 *             "description": "被告：韦斌强，男，1969年6月17日出生，汉族，住东阳市。",
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
 *             "description": "被告：杜满萍，女，1968年11月25日出生，汉族，住东阳市。",
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
 *             "description": "委托代理人：陈菊华、贾凌珂。",
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
 *             "description": "委托代理人：陈菊华、贾凌珂。",
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
 *       },
 *       "record": {
 *         "description": "原告韦斌姬为与被告韦斌强、杜满萍民间借贷纠纷一案，于2016年12月1日向本院提起诉讼，请求判令两被告归还借款10万元，并支付利息（自起诉之日起按中国人民银行同期同档次贷款基准利率计算至实际履行之日止）。本院受理后，依法由审判员甘震适用简易程序独任审判。被告杜满萍在提交答辩状期间对管辖权提出异议，本院裁定予以驳回。杜满萍不服该裁定，上诉至金华市中级人民法院。后金华市中级人民法院驳回上诉，维持原裁定。2017年4月20日，被告杜满萍申请对借条中“杜满萍”的签名是否系其本人书写进行鉴定，本院依法委托金华天鉴司法鉴定所进行鉴定。本院于2017年7月6日公开开庭审理了本案。原告韦斌姬、被告韦斌强及被告杜满萍的委托代理人贾凌珂到庭参加了诉讼。本案现已审理终结。",
 *         "cause": "民间借贷纠纷",
 *         "court": true,
 *         "courtInfo": "公开审理",
 *         "courtDate": "2017年7月6日",
 *         "suitDate": "2016年12月1日",
 *         "tribunal": "独任庭",
 *         "single": true,
 *         "convert": false,
 *         "changeProcedure": false,
 *         "prev": [],
 *         "stage": 1,
 *         "source": "新收",
 *         "procedure": "简易程序"
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
