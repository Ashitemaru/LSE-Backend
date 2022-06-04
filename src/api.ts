import express from "express";
import { client } from "./elastic";
import { ResponseError } from "@elastic/transport/lib/errors";

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
 * @apiQuery {string} limit=10 查询记录数量上限
 * @apiQuery {string} offset=0 查询起始记录偏移量
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
 * @apiSuccess {json} hits.detail 案件基本情况
 * @apiSuccess {json} hits.analysis 裁判分析过程
 * @apiSuccess {json} hits.result 判决结果
 * @apiSuccess {json[]} hits.timeline 时间线
 * @apiSuccess {json} hits.footer 文尾
 * @apiSuccessExample {json} Success-Response:
 *  {
 *   "time": 6,
 *   "count": 113,
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
 *         "description": "略",
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
 *       },
 *       "detail": {
 *         "content": "略",
 *         "references": []
 *       },
 *       "analysis": {
 *         "content": "略",
 *         "references": [
 *           {
 *             "name": "《中华人民共和国合同法》",
 *             "clauses": [
 *               {
 *                 "t": "第二百零六条"
 *               },
 *               {
 *                 "t": "第二百零七条"
 *               }
 *             ]
 *           }
 *         ]
 *       },
 *       "result": {
 *         "content": "略",
 *         "references": []
 *       },
 *       "timeline": [
 *         {
 *           "origin": "查明事实段",
 *           "content": "本院经审理查明：2011年4月25日，被告韦斌强、杜满萍向原告韦斌姬借款10万元，并共同出具了借条一份，内容为：“今向韦斌姬借人民币拾万元正",
 *           "date": "2011年4月25日"
 *         }
 *       ],
 *       "footer": {
 *         "date": "2017年7月7日",
 *         "year": "2017",
 *         "month": "7",
 *         "judges": [
 *           {
 *             "type": "审判组织成员",
 *             "name": "甘震",
 *             "role": "审判员"
 *           },
 *           {
 *             "type": "审判组织成员",
 *             "name": "许天瑶",
 *             "role": "代书记员"
 *           },
 *           {
 *             "type": "法官成员",
 *             "name": "甘震",
 *             "role": "审判员"
 *           }
 *         ]
 *       }
 *     }
 *   ]
 * }
 * @apiVersion 0.0.1
 */
router.get("/demo/search", async (req, res) => {
    if (typeof req.query.keyword !== "string") {
        res.status(400).json({ msg: "Query param `keyword` is required." });
        return;
    }
    if (typeof req.query.limit === "string" && isNaN(Number(req.query.limit))) {
        res.status(400).json({ msg: "Query param `limit` shall be numeric." });
        return;
    }
    if (typeof req.query.offset === "string" && isNaN(Number(req.query.offset))) {
        res.status(400).json({ msg: "Query param `offset` shall be numeric." });
        return;
    }
    if (Number(req.query.limit) > 200 || Number(req.query.offset) + Number(req.query.limit) > 500) {
        res.status(400).json({ msg: "Query param `limit` and/or `offset` is too large." });
        return;
    }
    if (!await client.indices.exists({ index: "demo-index" })) {
        res.status(500).json({ msg: "Demo dataset is not setup yet." });
        return;
    }
    const { keyword, limit, offset } = req.query;
    const { took, hits: { total, hits } } = await client.search({
        index: "demo-index",
        query: {
            match: {
                title: keyword,
            }
        }
    }, {
        querystring: {
            from: offset,
            size: limit,
        }
    });
    if (total === undefined || typeof total === "number") {
        res.status(500).json({ msg: "Unexpected type of field `total`." });
        return;
    }
    res.json({
        time: took,
        count: total.value,
        hits: hits.map(({ _source }) => _source),
    });
});

/**
 * @api {get} /api/demo/document/:id 查找指定编号的 demo 文档
 * @apiDescription 查找指定编号的 demo 文档
 * @apiName demo-document-id
 * @apiGroup demo
 * @apiParam {string} id demo 文档编号
 * @apiSuccess {string} id 序号
 * @apiSuccess {string} title 标题
 * @apiSuccess {json} court 法院信息
 * @apiSuccess {json} document 文书信息
 * @apiSuccess {json} _case 案件信息
 * @apiSuccess {json} persons 当事人信息
 * @apiSuccess {json} record 诉讼记录
 * @apiSuccess {json} detail 案件基本情况
 * @apiSuccess {json} analysis 裁判分析过程
 * @apiSuccess {json} result 判决结果
 * @apiSuccess {json[]} timeline 时间线
 * @apiSuccess {json} footer 文尾
 * @apiVersion 0.0.1
 */
router.get("/demo/document/:documentId", async (req, res) => {
    const { documentId } = req.params;
    try {
        const { _source } = await client.get({
            index: "demo-index",
            id: documentId,
        });
        res.json(_source);
    } catch (e: any) {
        if (e instanceof ResponseError && e.meta.statusCode === 404) {
            res.status(404).json({ msg: "Document not found." });
        } else {
            res.status(500).json({ msg: e?.message });
        }
    }
});

export default router;
