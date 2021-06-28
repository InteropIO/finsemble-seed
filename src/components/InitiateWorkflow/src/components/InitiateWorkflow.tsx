import * as React from "react";
import { useEffect, useState } from "react";
import { InitiateWorkflow } from '@finsemble/finsemble-ui/react/components/InitiateWorkflow/InitiateWorkflow'
import { ExecuteWorkflow, InputType, InputValue, Workflow } from "@finsemble/finsemble-ui/react/types/workflowTypes";
// import { ContentTypeDetecter } from "./contentTypeDetecter/ContentTypeDetecter"
// const {fdc3InstrumentSchema } = require("./contentTypeDetecter/schema/instrument.schema.json");
const {fdc3ContextSchema } = require("./contentTypeDetecter/schema/context.schema.json");


// const contentTypeDetecter = new ContentTypeDetecter(['SEDOL', 'CUSIP', 'ISIN', 'FDC3CONTACT', 'FDC3CONTACTLIST', 'FDC3COUNTRY', 'FDC3INSTRUMENT', 'FDC3INSTRUMENTLIST', 'FDC3ORGANIZATION', 'FDC3PORTFOLIO', 'FDC3POSITION', 'JSON', 'CSV', 'NUMBER'])

const inputTypes = [
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
        validators: null,
        // validators: [contentTypeDetecter.isin.bind(contentTypeDetecter)],
        schemaURL: null,
    },
    {
        id: "CUSIP",
        name: "CUSIP code",
        format: "text",
        validators: null,
        // validators: [contentTypeDetecter.cusip.bind(contentTypeDetecter)],
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
        schemaURL: fdc3ContextSchema as URL
    },
    {
        id: "STRING",
        name: "String",
        format: "text",
        validators: [],
        schemaURL: null
    }
] as InputType[];

const defaultWorkflows = [
    {
        id: "analyzeISIN",
        inputTypeId: "ISIN",
        name: "Analyze ISIN",
        macroKeys: ["Control", "Shift", "k"],
        inputSources: [],
        sequences: [],
        validationMessage: "Workflow is incomplete",
    },
    {
        id: "createOrder",
        inputTypeId: "ISIN",
        name: "Create Order",
        macroKeys: ["Control", "Shift", "o"],
        inputSources: [],
        sequences: [],
        validationMessage: "Workflow is incomplete",
    },
    {
        id: "viewPositions",
        inputTypeId: "ISIN",
        name: "View Positions",
        macroKeys: null,
        inputSources: [],
        sequences: [],
        validationMessage: "",
    },
    {
        id: "viewClinet",
        inputTypeId: "FDC3ORDER",
        name: "View Clinet",
        inputSources: [],
        sequences: [],
        macroKeys: ["Control", "Shift", "l"],
        validationMessage: "",
    },
    {
        id: "visualizTrades",
        inputTypeId: "FDC3ORDER",
        name: "Visualiz Trades",
        inputSources: [],
        sequences: [],
        macroKeys: ["Control", "Shift", "t"],
        validationMessage: "",
    },
    {
        id: "murexToExcel",
        inputTypeId: "tabDelimitedCSV",
        name: "Murex to Excel",
        inputSources: [],
        sequences: [],
        macroKeys: ["Control", "Shift", "e"],
        validationMessage: "",
    },
] as Workflow[];

const onClose = () => {
    console.log("onClose");
    FSBL.Clients.WindowClient.close({ removeFromWorkspace: true, closeWindow: true });
}


const InitiateWorkflowComponet = (props: any) => {
    let [autofocusTab, setAutofocusTab] = useState<0 | 1>(0);
    let [inputValue, setInputValue] = useState<any>();
    let [selectInputId, setSelectInputId] = useState<string>("");
    const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);

    useEffect(() => {
        let spawndata = FSBL.Clients.WindowClient.getSpawnData()
        console.log(spawndata);
        if (spawndata.mode == 'clipboard') {
            setAutofocusTab(0)
            // FSBL.System.Clipboard.readText("", (clipboardData: string) => {
            //     let contentType = contentTypeDetecter.detect(clipboardData)
            //     console.log("clipboardData: ", clipboardData, 'Type: ', contentType)

            //     setSelectInputId(contentType)
            //     if(contentType === 'CSV')
            //         setInputValue(contentTypeDetecter.csvToArray(clipboardData))
            //     else
            //         setInputValue(clipboardData)

            //     // setTimeout(()=>{
            //     //     setInputValue(clipboardData)
            //     // },2000)
            // })
        } else if (spawndata.mode == 'input') {
            setAutofocusTab(1)
        }

        if(spawndata.workflow){
            setWorkflows([spawndata.workflow]);
        }
    }, []);
    
    const onWorkflowInit: ExecuteWorkflow = (inputValue: InputValue, inputType: InputType, workflow: Workflow) => {
        console.log('onWorkflowInit')

        FSBL.Clients.RouterClient.query("Workflow.runWorkflow", {workflow}, (err, response) => {
            if(err === null){
                finsembleWindow.close();
            }
        });

        return { success: true, actionResults: [[{ success: true }]] }
    }

    return (
        <div id='InitiateWorkflow'>
            <InitiateWorkflow inputTypes={inputTypes} workflows={workflows} onClose={onClose} onWorkflowInit={onWorkflowInit} value={inputValue} selectedInputId={selectInputId} autofocusTab={autofocusTab} />
        </div>
    );
};

export default InitiateWorkflowComponet;