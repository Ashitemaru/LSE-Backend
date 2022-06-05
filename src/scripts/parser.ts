import {
    Analysis,
    Case,
    Clause,
    Court,
    Detail,
    Document,
    Event,
    File,
    Footer,
    Judge,
    Person,
    Persons,
    Prev,
    Record,
    Reference,
    Representative,
    Result,
} from "../types";
import { doc2vec } from "./doc2vec";

export const parseHead = (WS: any): {
    title: string,
    court: Court,
    document: Document,
    _case?: Case,
} => {
    const title = WS.attr_value;
    const court = {
        name: WS.JBFY.attr_value,
        code: WS.JBFY.FYCJM?.attr_value,
        level: WS.JBFY.FYJB?.attr_value,
        province: WS.JBFY.XZQH_P?.attr_value,
        city: WS.JBFY.XZQH_C?.attr_value,
    };
    const document = WS.WSMC === undefined && WS.attr_value.includes("民事裁判书")
        ? {
            name: "民事裁判书",
            type: "民事裁判书",
        }
        : WS.WSMC === undefined && WS.attr_value.includes("民事判决书")
            ? {
                name: "民事判决书",
                type: "民事判决书",
            }
            : {
                name: WS.WSMC?.attr_value ?? WS.WSZL.attr_value,
                type: WS.WSZL?.attr_value ?? WS.WSMC.attr_value,
            };
    try {
        const _case = {
            name: WS.AH.attr_value,
            token: WS.AH.ZH.attr_value,
            type: WS.AJLX.attr_value,
            primaryType: WS.AJLB.attr_value,
            secondaryType: WS.SPCX?.attr_value,
            year: WS.AH.LAND.attr_value,
            courtAlias: WS.AH.FYJC.attr_value,
            id: WS.AH.AHSXH.attr_value,
        };
        return { title, court, document, _case };
    } catch (e) {
        if (e instanceof TypeError) {
            return { title, court, document };
        } else {
            throw e;
        }
    }
};

const parseSinglePerson = (person: any): Person => ({
    name: person.SSCYR.attr_value,
    role: person.attr_nameCN,
    description: person.attr_value,
    status: person.SSSF.attr_value,
    type: person.DSRLX.attr_value,
    gender: person.XB?.attr_value,
    ethnicity: person.MZ?.attr_value,
    birthday: person.CSRQ?.attr_value,
    location: person.DSRDZ?.attr_value,
    nationality: person.GJ?.attr_value,
    category: person.DSRLB?.attr_value,
    identity: person.ZRRSF?.attr_value,
});

const parseRepresentativeObjects = (DLDX: any): string[] => {
    if (DLDX === undefined) {
        return [];
    } else if (DLDX instanceof Array) {
        return DLDX.map((e: any) => e.attr_value);
    } else {
        return DLDX.attr_value;
    }
};

const parseSingleRepresentative = (person: any): Representative => ({
    ...parseSinglePerson(person),
    objects: parseRepresentativeObjects(person.DLDXJH?.DLDX),
    representationType: person.DLZL?.attr_value,
    representativeOccupation: person.DLRBHRZYLX?.attr_value,
    representativeType: person.BHRHSSDLRLX?.attr_value,
});

export const parsePerson = (o: any): Person[] => {
    const people = o === undefined ? [] : o instanceof Array ? o : [o];
    return people.map(parseSinglePerson);
};

export const parseRepresentative = (o: any): Representative[] => {
    const people = o === undefined ? [] : o instanceof Array ? o : [o];
    return people.map(parseSingleRepresentative);
};

export const parsePersons = (DSR: any): Persons | undefined => {
    if (DSR === undefined) {
        return undefined;
    }
    const prosecutors = parsePerson(DSR.QSF);
    const defendants = parsePerson(DSR.YSF);
    const representatives = parseRepresentative(DSR.DLR);
    const joinder = DSR.GTSS === undefined ? undefined : DSR.GTSS.attr_value === "是";
    return {
        prosecutors,
        defendants,
        representatives,
        joinder,
    };
};

export const parsePrev = (AJYLYSLJGD: any): Prev[] => {
    const prev = AJYLYSLJGD === undefined ? [] : AJYLYSLJGD instanceof Array ? AJYLYSLJGD : [AJYLYSLJGD];
    return prev.map((o) => ({
        prevName: o.QSAH?.attr_value,
        prevYear: o.QSAH?.QSAHLAND?.attr_value,
        prevCaseId: o.QSAH?.QSAHSXH?.attr_value,
        prevCourt: o.QSFY?.attr_value,
        prevCourtProvince: o.QSFY?.XZQH_P?.attr_value,
        prevCourtCity: o.QSFY?.XZQH_C?.attr_value,
        prevType: o.QSWSZL?.attr_value,
        prevDate: o.QSCPSJ?.attr_value,
        prevStage: o.QSSJ?.attr_value,
        prevCause: o.QSAJYL?.attr_value,
        prevResult: o.QSJAFS?.attr_value,
    }));
};

export const parseRecord = (SSJL: any) : Record | undefined => {
    if (SSJL === undefined) {
        return undefined;
    }
    const recordBase = {
        description: SSJL.attr_value,
        cause: SSJL.AY?.attr_value,
        type: SSJL.SSXZ?.attr_value,
        court: SSJL.KTSL === undefined ? undefined : SSJL.KTSL.attr_value === "是",
        juvenile: SSJL.SNFT === undefined ? undefined : SSJL.SNFT.attr_value === "是",
        courtInfo: SSJL.KTSLXX?.attr_value,
        courtDate: SSJL.KTRQ?.attr_value,
        suitDate: SSJL.QSRQ?.attr_value,
        acceptDate: SSJL.SLRQ?.attr_value,
        tribunal: SSJL.SPZZ?.attr_value,
        single: SSJL.DRSP === undefined ? undefined : SSJL.DRSP.attr_value === "是",
        convert: SSJL.JYZPT === undefined ? undefined : SSJL.JYZPT.attr_value === "是",
        changeProcedure: SSJL.SFBGSYCX === undefined ? undefined : SSJL.SFBGSYCX.attr_value === "是",
        prev: parsePrev(SSJL.AJYLYSLJGD),
    };
    if (SSJL.YSAJLY !== undefined) {
        return {
            ...recordBase,
            stage: 1,
            source: SSJL.YSAJLY.attr_value,
            procedure: SSJL.YSAJSYCX?.attr_value,
        };
    } else if (SSJL.ESAJLY !== undefined) {
        return {
            ...recordBase,
            stage: 2,
            source: SSJL.ESAJLY.attr_value,
        };
    } else {
        return {
            ...recordBase,
            stage: undefined,
        };
    }
};

const parseClauses = (T: any): Clause[] => {
    const clauses = T === undefined ? [] : T instanceof Array ? T : [T];
    return clauses.map((t) => ({
        t: t.attr_value,
        k: t.K?.attr_value,
        x: t.X?.attr_value,
    }));
};

export const parseReference = (FLFTYY: any): Reference[] => {
    const references = FLFTYY === undefined ? [] : FLFTYY instanceof Array ? FLFTYY : [FLFTYY];
    const result: Reference[] = [];
    references.forEach((r) => {
        const groups: any[] = r.FLFTFZ === undefined ? [] : r.FLFTFZ instanceof Array ? r.FLFTFZ : [r.FLFTFZ];
        groups.forEach((g) => {
            if (g.MC !== undefined) {
                result.push({
                    name: g.MC.attr_value,
                    clauses: parseClauses(g.T),
                });
            }
        });
    });
    return result;
};

export const parseDetail = (AJJBQK: any): Detail | undefined => {
    if (AJJBQK === undefined) {
        return undefined;
    }
    return {
        content: AJJBQK.attr_value,
        references: parseReference(AJJBQK.FLFTYY),
    };
};

export const parseAnalysis = (CPFXGC: any): Analysis | undefined => {
    if (CPFXGC === undefined) {
        return undefined;
    }
    return {
        content: CPFXGC.attr_value,
        references: parseReference(CPFXGC.FLFTYY),
    };
};

export const parseResult = (PJJG: any): Result | undefined => {
    if (PJJG === undefined) {
        return undefined;
    }
    return {
        content: PJJG.attr_value,
        references: parseReference(PJJG.FLFTYY),
    };
};

export const parseTimeline = (CUS_SJX: any): Event[] => {
    const events: any[] = CUS_SJX?.CUS_SJ === undefined ? [] : CUS_SJX.CUS_SJ instanceof Array ? CUS_SJX.CUS_SJ : [CUS_SJX.CUS_SJ];
    return events.map((CUS_SJ) => ({
        origin: CUS_SJ.CUS_DLLY.attr_value,
        content: CUS_SJ.CUS_YW.attr_value,
        date: CUS_SJ.CUS_JTSJ?.attr_value,
    }));
};

export const parseFooter = (WW: any): Footer | undefined => {
    if (WW === undefined) {
        return undefined;
    }
    const judges: Judge[] = [];
    const spzzcy: any[] = WW.SPZZCY === undefined ? [] : WW.SPZZCY instanceof Array ? WW.SPZZCY : [WW.SPZZCY];
    spzzcy.forEach((SPZZCY) => {
        judges.push({
            type: "审判组织成员",
            name: SPZZCY.SPRYXM.attr_value,
            role: SPZZCY.SPRYJS.attr_value,
        });
    });
    const fgcy: any[] = WW.CUS_FGCY === undefined ? [] : WW.CUS_FGCY instanceof Array ? WW.CUS_FGCY : [WW.CUS_FGCY];
    fgcy.forEach((CUS_FGCY) => {
        judges.push({
            type: "法官成员",
            name: CUS_FGCY.FGRYXM.attr_value,
            role: CUS_FGCY.FGRYJS.attr_value,
        });
    });
    return {
        date: WW.CPSJ?.attr_value,
        year: WW.CPSJ?.JAND?.attr_value,
        month: WW.CPSJ?.CUS_JAYF?.attr_value,
        judges,
    };
};

export const parseFile = (filename: string, writ: any): File => {
    const id = filename.replace(".xml", "");
    const { QW: { WS, DSR, SSJL, AJJBQK, CPFXGC, PJJG, WW, CUS_SJX } } = writ;
    const { title, court, document, _case } = parseHead(WS);
    const content = writ.QW.attr_value;
    const persons = parsePersons(DSR);
    const record = parseRecord(SSJL);
    const detail = parseDetail(AJJBQK);
    const analysis = parseAnalysis(CPFXGC);
    const result = parseResult(PJJG);
    const footer = parseFooter(WW);
    const timeline = parseTimeline(CUS_SJX);
    const featureVector = doc2vec(content);
    if (featureVector === undefined) {
        throw new Error(`Feature vector of document ${id} is undefined!`);
    }
    const prosecutors = persons?.prosecutors?.map((p) => p.name) ?? [];
    const defendants = persons?.defendants.map((p) => p.name) ?? [];
    const representatives = persons?.representatives.map((p) => p.name) ?? [];
    const personSet = Array.from(new Set(prosecutors.concat(defendants).concat(representatives)));
    const detailReferences = detail?.references.map((r) => r.name) ?? [];
    const analysisReferences = analysis?.references.map((r) => r.name) ?? [];
    const resultReferences = result?.references.map((r) => r.name) ?? [];
    const referenceSet = Array.from(new Set(detailReferences.concat(analysisReferences).concat(resultReferences)));
    return {
        id,
        title,
        content,
        court,
        document,
        _case,
        persons,
        record,
        detail,
        analysis,
        result,
        timeline,
        footer,
        cause: record?.cause,
        personSet,
        referenceSet,
        featureVector,
    };
};
