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

export default router;
