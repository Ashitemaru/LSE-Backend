import { Case, Court, Document, Person, Persons, Prev, Record, Representative } from "../types";

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
