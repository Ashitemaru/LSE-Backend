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
    name: string; // 案件名称
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
