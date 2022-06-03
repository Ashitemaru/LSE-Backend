export interface Court {
    name: string; // 法院名称
    code?: string; // 法院层级码
    level?: string; // 法院级别
    province?: string; // 行政区划(省)
    city?: string; // 行政区划(市)
}

export interface Document {
    name: string; // 文书名称
    type: string; // 文书种类
}

export interface Case {
    name: string; // 案件案号
    token: string; // 案件字号
    type: string; // 案件类型
    primaryType: string; // 案件一级类别
    secondaryType?: string; // 案件二级类别
    year: string; // 年份
    courtAlias: string; // 法院简称
    id: string; // 案号顺序号
}

export interface Person {
    name: string; // 姓名
    role: string; // 角色
    description: string; // 简介
    status: string; // 诉讼身份
    type: string; // 当事人类型
    gender?: string; // 性别
    ethnicity?: string; // 民族
    birthday?: string; // 出生日期
    location?: string; // 当事人地址
    nationality?: string; // 国籍
    category?: string; // 当事人类别
    identity?: string; // 自然人身份
}

export interface Representative extends Person {
    objects: string[]; // 代理对象
    representationType?: string; // 代理种类
    representativeOccupation?: string; // 代理人辩护人职业类型
    representativeType?: string; // 辩护人或诉讼代理人类型
}

export interface Persons {
    prosecutors: Person[]; // 起诉方
    defendants: Person[]; // 应诉方
    representatives: Representative[]; // 代理人
    joinder: boolean | undefined; // 是否共同诉讼
}

export interface Prev {
    prevName?: string; // 前审案号
    prevYear?: string; // 前审案号立案年度
    prevCaseId?: string; // 前审案号顺序号
    prevCourt?: string; // 前审法院
    prevCourtProvince?: string; // 前审法院行政区划(省)
    prevCourtCity?: string; // 前审法院行政区划(市)
    prevType?: string; // 前审文书种类
    prevDate?: string; // 前审裁判时间
    prevStage?: string; // 前审审级
    prevCause?: string; // 前审案件由来
    prevResult?: string; // 前审结案方式
}

export interface RecordBase {
    description: string; // 诉讼记录
    cause?: string; // 案由
    type?: string; // 诉讼性质
    court?: boolean; // 开庭审理
    juvenile?: boolean; // 少年法庭
    courtInfo?: string; // 开庭审理信息
    courtDate?: string; // 开庭日期
    suitDate?: string; // 起诉日期
    acceptDate?: string; // 受理日期
    tribunal?: string; // 审判组织
    single?: boolean; // 独任审判
    convert?: boolean; // 简易转普通
    changeProcedure?: boolean; // 是否变更适用程序
    prev: Prev[]; // 案件由来与审理经过段
}

export interface RecordStageOne extends RecordBase {
    stage: 1;
    source: string; // 一审案件来源
    procedure?: string; // 一审案件适用程序
}

export interface RecordStageTwo extends RecordBase {
    stage: 2;
    source: string; // 二审案件来源
}

export interface RecordStageUnknown extends RecordBase {
    stage: undefined;
}

export type Record = RecordStageOne | RecordStageTwo | RecordStageUnknown;
