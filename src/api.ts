import express from "express";
import { client } from "./elastic";
import { ResponseError } from "@elastic/transport/lib/errors";
import { File } from "./types";
import { doc2vec } from "./scripts/doc2vec";
import { Request, Response } from "express-serve-static-core";

const router = express.Router();

const checkLimitOffset = (req:Request, res:Response): boolean => {
    if (typeof req.query.limit === "string" && isNaN(Number(req.query.limit))) {
        res.status(400).json({ msg: "Query param `limit` shall be numeric." });
        return false;
    }
    if (typeof req.query.offset === "string" && isNaN(Number(req.query.offset))) {
        res.status(400).json({ msg: "Query param `offset` shall be numeric." });
        return false;
    }
    if (Number(req.query.limit) > 200 || Number(req.query.offset) + Number(req.query.limit) > 500) {
        res.status(400).json({ msg: "Query param `limit` and/or `offset` is too large." });
        return false;
    }
    return true;
};

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
 * @api {get} /api/demo/search 对 demo 数据进行全文查询
 * @apiDescription 对 demo 数据进行全文查询
 * @apiName demo-search
 * @apiGroup demo
 * @apiQuery {string} keyword 查询的关键词
 * @apiQuery {number} limit=10 查询记录数量上限
 * @apiQuery {number} offset=0 查询起始记录偏移量
 * @apiSuccess {number} time 查询耗时
 * @apiSuccess {number} count 命中记录总数
 * @apiSuccess {json[]} hits 命中记录
 * @apiSuccess {string} hits.id 编号
 * @apiSuccess {string} hits.content 正文缩略信息，带高亮
 * @apiSuccess {json} hits.court 法院信息
 * @apiSuccess {json} hits.document 文书信息
 * @apiSuccess {json} hits._case 案件信息
 * @apiSuccess {json} hits.persons 当事人信息
 * @apiSuccess {json} hits.footer 文尾
 * @apiSuccess {string} hits.resultOneWord 结案方式标签
 * @apiSuccess {number} hits.score 搜索结果得分
 * @apiSuccessExample {json} Success-Response:
 *  {
 *   "time": 8,
 *   "count": 235,
 *   "hits": [
 *     {
 *       "id": "19682",
 *       "content": "略",
 *       "court": {
 *         "name": "浙江省嵊泗县人民法院",
 *         "code": "BA4",
 *         "level": "基层",
 *         "province": "浙江",
 *         "city": "舟山市"
 *       },
 *       "document": {
 *         "name": "民事判决书",
 *         "type": "判决书"
 *       },
 *       "_case": {
 *         "name": "（2015）舟嵊民初字第84号",
 *         "token": "民初字",
 *         "type": "民事一审案件",
 *         "primaryType": "民事案件",
 *         "secondaryType": "一审案件",
 *         "year": "2015",
 *         "courtAlias": "舟嵊",
 *         "id": "84"
 *       },
 *       "persons": {
 *         "prosecutors": [
 *           {
 *             "name": "王明群",
 *             "role": "起诉方",
 *             "description": "原告王明群。",
 *             "status": "原告",
 *             "type": "自然人",
 *             "nationality": "中国",
 *             "category": "原告",
 *             "identity": "其他"
 *           }
 *         ],
 *         "defendants": [
 *           {
 *             "name": "尚记堂",
 *             "role": "应诉方",
 *             "description": "被告尚记堂。",
 *             "status": "被告",
 *             "type": "自然人",
 *             "nationality": "中国",
 *             "category": "被告",
 *             "identity": "其他"
 *           }
 *         ],
 *         "representatives": [
 *           {
 *             "name": "郑力源",
 *             "role": "代理人",
 *             "description": "委托代理人（特别授权）郑力源，嵊泗县法律援助中心法律援助志愿者。",
 *             "status": "委托代理人（特别授权）",
 *             "type": "自然人",
 *             "nationality": "中国",
 *             "category": "代理人",
 *             "identity": "其他",
 *             "objects": "王明群",
 *             "representationType": "委托代理",
 *             "representativeOccupation": "非法务人员",
 *             "representativeType": "法院许可的其他公民"
 *           },
 *           {
 *             "name": "郑泽宇",
 *             "role": "代理人",
 *             "description": "委托代理人（特别授权）郑泽宇，嵊泗县法律援助中心法律援助志愿者。",
 *             "status": "委托代理人（特别授权）",
 *             "type": "自然人",
 *             "nationality": "中国",
 *             "category": "代理人",
 *             "identity": "其他",
 *             "objects": "王明群",
 *             "representationType": "委托代理",
 *             "representativeOccupation": "非法务人员",
 *             "representativeType": "法院许可的其他公民"
 *           }
 *         ],
 *         "joinder": false
 *       },
 *       "footer": {
 *         "date": "2015年6月17日",
 *         "year": "2015",
 *         "month": "6",
 *         "judges": [
 *           {
 *             "type": "审判组织成员",
 *             "name": "沈洁琼",
 *             "role": "审判员"
 *           },
 *           {
 *             "type": "审判组织成员",
 *             "name": "陈燕燕",
 *             "role": "代书记员"
 *           },
 *           {
 *             "type": "法官成员",
 *             "name": "沈洁琼",
 *             "role": "审判员"
 *           }
 *         ]
 *       },
 *       "resultOneWord": "判决",
 *       "score": 57.433887
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
    if (!checkLimitOffset(req, res)) {
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
            query_string: {
                query: keyword,
                fields: ["content"],
            },
        },
        highlight: {
            fields: {
                content: {},
            },
        },
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
        hits: hits.map(({ _source, _score, highlight }) => {
            const file: File = _source as File;
            return {
                id: file.id,
                content: "..." + (highlight?.content[0] ?? file.content.slice(100, 150)) + "...",
                court: file.court,
                document: file.document,
                _case: file._case,
                persons: file.persons,
                footer: file.footer,
                resultOneWord: file.resultOneWord,
                score: _score,
            };
        }),
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
 * @apiSuccess {json} resultOneWord 结案方式标签
 * @apiSuccess {json[]} timeline 时间线
 * @apiSuccess {json} footer 文尾
 * @apiSuccess {json[]} recommend 类似文书推荐
 * @apiSuccess {string} recommend.id 类似文书编号
 * @apiSuccess {string} recommend.content 类似文书摘要
 * @apiSuccess {string} recommend.court 类似文书法庭信息
 * @apiSuccess {string} recommend.document 类似文书文书信息
 * @apiSuccess {string} recommend._case 类似文书案件信息
 * @apiSuccess {string} recommend.persons 类似文书当事人信息
 * @apiVersion 0.0.1
 */
router.get("/demo/document/:documentId", async (req, res) => {
    const { documentId } = req.params;
    try {
        const { _source } = await client.get({
            index: "demo-index",
            id: documentId,
        });
        const file = _source as File;
        const { hits: { hits } } = await client.search({
            index: "demo-index",
            query: {
                script_score: {
                    query: { match_all: {} },
                    script: {
                        source: "cosineSimilarity(params.queryVector, 'featureVector') + 1.0",
                        params: { queryVector: file.featureVector },
                    }
                }
            },
        }, { querystring: { from: 1, size: 5 } });
        res.json({
            ...file,
            cause: undefined,
            personSet: undefined,
            referenceSet: undefined,
            featureVector: undefined,
            recommend: hits.map((hit) => {
                const similarFile = hit._source as File;
                return {
                    id: similarFile.id,
                    content: similarFile.content.slice(0, 200) + "...",
                    court: similarFile.court,
                    document: similarFile.document,
                    _case: similarFile._case,
                    persons: similarFile.persons,
                };
            })
        });
    } catch (e: any) {
        if (e instanceof ResponseError && e.meta.statusCode === 404) {
            res.status(404).json({ msg: "Document not found." });
        } else {
            res.status(500).json({ msg: e?.message });
        }
    }
});

/**
 * @api {post} /api/demo/search/similar 对 demo 数据进行相似文本查询
 * @apiDescription 对 demo 数据进行相似文本查询
 * @apiName demo-search-similar
 * @apiGroup demo
 * @apiBody {string} document 查询文本
 * @apiBody {number} limit=10 查询记录数量上限
 * @apiBody {number} offset=0 查询起始记录偏移量
 * @apiSuccess {number} time 查询耗时
 * @apiSuccess {number} count 命中记录总数
 * @apiSuccess {json[]} hits 命中记录
 * @apiSuccess {string} hits.id 编号
 * @apiSuccess {string} hits.content 正文
 * @apiSuccess {json} hits.court 法院信息
 * @apiSuccess {json} hits.document 文书信息
 * @apiSuccess {json} hits._case 案件信息
 * @apiSuccess {json} hits.persons 当事人信息
 * @apiSuccess {string[]} possibleCauses 可能的案由
 * @apiSuccessExample {json} Success-Response:
 *  {
 *   "time": 8,
 *   "count": 235,
 *   "hits": [
 *     {
 *       "id": "19682",
 *       "content": "略",
 *       "court": {
 *         "name": "浙江省嵊泗县人民法院",
 *         "code": "BA4",
 *         "level": "基层",
 *         "province": "浙江",
 *         "city": "舟山市"
 *       },
 *       "document": {
 *         "name": "民事判决书",
 *         "type": "判决书"
 *       },
 *       "_case": {
 *         "name": "（2015）舟嵊民初字第84号",
 *         "token": "民初字",
 *         "type": "民事一审案件",
 *         "primaryType": "民事案件",
 *         "secondaryType": "一审案件",
 *         "year": "2015",
 *         "courtAlias": "舟嵊",
 *         "id": "84"
 *       },
 *       "possibleCauses": [
 *         "民间借贷纠纷",
 *         "离婚纠纷",
 *         "共有物分割纠纷",
 *         "不当得利纠纷",
 *         "确认合同无效纠纷"
 *       ]
 *     }
 *   ]
 * }
 * @apiVersion 0.0.1
 */
router.post("/demo/search/similar", async (req, res) => {
    const { document, limit, offset } = req.body;
    if (typeof document !== "string") {
        res.status(400).json({ msg: "Post body param `document` is required." });
        return;
    }
    if (typeof limit === "string" && isNaN(Number(limit))) {
        res.status(400).json({ msg: "Post body param `limit` shall be numeric." });
        return;
    }
    if (typeof offset === "string" && isNaN(Number(offset))) {
        res.status(400).json({ msg: "Post body param `offset` shall be numeric." });
        return;
    }
    if (Number(limit) > 200 || Number(offset) + Number(limit) > 500) {
        res.status(400).json({ msg: "Post body param `limit` and/or `offset` is too large." });
        return;
    }
    const queryVector = doc2vec(document);
    if (queryVector === undefined) {
        res.status(400).json({ msg: "Post body param `document` shall not be empty." });
        return;
    }
    const { took, hits: { total, hits } } = await client.search({
        index: "demo-index",
        query: {
            script_score: {
                query: { match_all: {} },
                script: {
                    source: "cosineSimilarity(params.queryVector, 'featureVector') + 1.0",
                    params: { queryVector },
                }
            }
        },
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
    const causeResult = await client.search({
        index: "demo-cause",
        query: {
            script_score: {
                query: { match_all: {} },
                script: {
                    source: "cosineSimilarity(params.queryVector, 'featureVector') + 1.0",
                    params: { queryVector },
                }
            }
        },
    }, { querystring: { size: 5 } });
    res.json({
        time: took + causeResult.took,
        count: total.value,
        hits: hits.map(({ _source }) => {
            const file: File = _source as File;
            return {
                id: file.id,
                content: file.content,
                court: file.court,
                document: file.document,
                _case: file._case,
                persons: file.persons,
            };
        }),
        possibleCauses: causeResult.hits.hits.map(({ _source }) => (_source as any).cause),
    });
});

/**
 * @api {get} /api/demo/search/advanced 对 demo 数据进行高级搜索
 * @apiDescription 对 demo 数据进行高级搜索
 *
 * 注意各个查询字段之间是“与”的关系
 * @apiName demo-search-advanced
 * @apiGroup demo
 * @apiQuery {string} [province] 省份
 * @apiQuery {string} [city] 城市
 * @apiQuery {string} [court] 法院名称
 * @apiQuery {string} [type] 文书类型
 * @apiQuery {string} [name] 案件名称（注意是 _case.name）
 * @apiQuery {string} [year] 案件年份
 * @apiQuery {string} [cause] 案由
 * @apiQuery {string} [person] 当事人，多名当事人之间用','分隔
 * @apiQuery {string} [judge] 法官，多名法官之间用','分隔
 * @apiQuery {string} [reference] 法条，不含具体条款，多个法条之间用','分隔
 * @apiQuery {number} limit=10 查询记录数量上限
 * @apiQuery {number} offset=0 查询起始记录偏移量
 * @apiSuccess {number} time 查询耗时
 * @apiSuccess {number} count 命中记录总数
 * @apiSuccess {json[]} hits 命中记录
 * @apiSuccess {string} hits.id 编号
 * @apiSuccess {string} hits.content 正文缩略信息，带高亮
 * @apiSuccess {json} hits.court 法院信息
 * @apiSuccess {json} hits.document 文书信息
 * @apiSuccess {json} hits._case 案件信息
 * @apiSuccess {json} hits.persons 当事人信息
 * @apiSuccess {json} hits.footer 文尾
 * @apiSuccess {string} hits.resultOneWord 结案方式标签
 * @apiVersion 0.0.1
 */
router.get("/demo/search/advanced", async (req, res) => {
    if (!checkLimitOffset(req, res)) {
        return;
    }
    const queryToField = {
        province: "court.province",
        city: "court.city",
        court: "court.name",
        type: "document.type",
        name: "_case.name",
        year: "_case.year",
        cause: "cause",
        person: "personSet",
        judge: "footer.judges.name",
        reference: "referenceSet",
    } as const;
    const allowMultiple = ["person", "judge", "reference"] as (keyof typeof queryToField)[];
    const must: {"term": {[key: string]: string}}[] = [];
    for (const q of Object.keys(queryToField) as (keyof typeof queryToField)[]) {
        if (req.query[q] !== undefined && req.query[q] !== "") {
            const qValue = req.query[q];
            if (typeof qValue !== "string") {
                res.status(400).json({ msg: `Query param \`${q}\` shall be a string.` });
                return;
            }
            const qValues = allowMultiple.includes(q) ? qValue.split(",") : [qValue];
            for (const v of qValues) {
                const term: { [key: string]: string } = {};
                term[queryToField[q]] = v;
                must.push({ term });
            }
        }
    }
    const { took, hits: { total, hits } } = await client.search({
        index: "demo-index",
        query: { bool: { must } },
        highlight: {
            require_field_match: false,
            fields: {
                content: {},
            },
        },
    }, {
        querystring: {
            from: req.query.offset,
            size: req.query.limit,
        }
    });
    if (total === undefined || typeof total === "number") {
        res.status(500).json({ msg: "Unexpected type of field `total`." });
        return;
    }
    res.json({
        time: took,
        count: total.value,
        hits: hits.map(({ _source, highlight }) => {
            const file: File = _source as File;
            return {
                id: file.id,
                content: (highlight?.content[0] ?? file.content.slice(0, 80)) + "...",
                court: file.court,
                document: file.document,
                _case: file._case,
                persons: file.persons,
                footer: file.footer,
                resultOneWord: file.resultOneWord,
            };
        }),
    });
});

/**
 * @api {get} /api/demo/search/suggest 对 demo 数据进行搜索建议
 * @apiDescription 对 demo 数据进行搜索建议
 * @apiName demo-search-suggest
 * @apiGroup demo
 * @apiQuery {string} keyword 关键词
 * @apiSuccess {number} time 查询耗时
 * @apiSuccess {string} keyword 查询的关键词
 * @apiSuccess {json[]} suggest 查询建议
 * @apiSuccess {string} suggest.keyword 查询关键词
 * @apiSuccess {string=court,judge,cause} suggest.type 关键词类别
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "time": 2,
 *   "keyword": "江",
 *   "suggest": [
 *     {
 *       "keyword": "江苏省丰县人民法院",
 *       "type": "court"
 *     },
 *     {
 *       "keyword": "江苏省南京市中级人民法院",
 *       "type": "court"
 *     },
 *     {
 *       "keyword": "江玮",
 *       "type": "judge"
 *     },
 *     {
 *       "keyword": "江生根",
 *       "type": "judge"
 *     }
 *     {
 *       "keyword": "江苏省南京市雨花台区人民法院",
 *       "type": "court"
 *     }
 *   ]
 * }
 * @apiVersion 0.0.1
 */
router.get("/demo/search/suggest", async (req, res) => {
    const { keyword } = req.query;
    if (typeof keyword !== "string") {
        res.status(400).json({ msg: "Query param `keyword` is required." });
        return;
    }
    const { took, suggest } = await client.search({
        index: "demo-suggest",
        suggest: {
            suggestion: {
                prefix: keyword,
                completion: { field: "keyword.suggest" },
            },
        }
    });
    if (suggest === undefined) {
        res.status(500).json({ msg: "Suggest result is undefined!" });
        return;
    }
    const options = suggest.suggestion[0].options;
    if (!(options instanceof Array)) {
        res.status(500).json({ msg: "Suggest options result is not array!" });
        return;
    }
    res.json({
        time: took,
        keyword,
        suggest: options.map(({ _source }) => _source),
    });
});

/**
 * @api {get} /api/demo/hot/cause 查询 demo 数据集高频案由
 * @apiDescription 查询 demo 数据集高频案由
 * @apiName demo-hot-cause
 * @apiGroup demo
 * @apiQuery {number} [threshold=5] 阈值
 * @apiSuccess {number} time 查询耗时
 * @apiSuccess {string[]} data 高频案由
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "time": 2,
 *   "data": [
 *     "民间借贷纠纷",
 *     "劳动争议纠纷",
 *     "房屋买卖合同纠纷",
 *     "劳务合同纠纷",
 *     "借款合同纠纷"
 *   ]
 * }
 * @apiVersion 0.0.1
 */
router.get("/demo/hot/cause", async (req, res) => {
    if (typeof req.query.threshold === "string" && isNaN(Number(req.query.threshold))) {
        res.status(400).json({ msg: "Query param `threshold` shall be numeric." });
        return false;
    }
    const threshold = Number(req.query.threshold ?? 5);
    const { took, hits: { hits } } = await client.search({
        index: "demo-cause",
        query: { match_all: {} },
        sort: "count",
    }, { querystring: { size: threshold } });
    res.json({
        time: took,
        data: hits.map(({ _source }) => (_source as any).cause),
    });
});

export default router;
