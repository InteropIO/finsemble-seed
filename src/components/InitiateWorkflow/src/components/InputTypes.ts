import { ContentTypeDetecter } from "./contentTypeDetecter/ContentTypeDetecter";
const contentTypeDetecter = new ContentTypeDetecter(['SEDOL', 'CUSIP', 'ISIN', 'FDC3CONTACT', 'FDC3CONTACTLIST', 'FDC3COUNTRY', 'FDC3INSTRUMENT', 'FDC3INSTRUMENTLIST', 'FDC3ORGANIZATION', 'FDC3PORTFOLIO', 'FDC3POSITION', 'JSON', 'CSV', 'NUMBER'])

export const inputTypes = [
    {
        id: "CSV",
        name: "Tab Delimited CSV",
        format: "table",
        validators: null,
        schemaURL: null,
    },
    {
        id: "ISIN",
        name: "ISIN code",
        format: "text",
        validators: [contentTypeDetecter.isin.bind(contentTypeDetecter)],
        schemaURL: null,
    },
    {
        id: "CUSIP",
        name: "CUSIP code",
        format: "text",
        validators: [contentTypeDetecter.cusip.bind(contentTypeDetecter)],
        schemaURL: null,
    },
    {
        id: "FDC3INSTRUMENT",
        name: "fdc3.instrument",
        format: "json",
        validators: [],
        schemaURL: new URL("https://fdc3.finos.org/schemas/next/instrument.schema.json"),
    },
    {
        id: "FDC3ORDER",
        name: "fdc3.order",
        format: "json",
        validators: [],
        schemaURL: new URL("https://fdc3.finos.org/schemas/next/context.schema.json")
    },
    {
        id: "STRING",
        name: "String",
        format: "text",
        validators: [],
        schemaURL: null
    }
];