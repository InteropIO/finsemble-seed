import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { InitiateWorkflow } from '@finsemble/finsemble-ui/react/components/InitiateWorkflow/InitiateWorkflow'
import { ExecuteWorkflow, InputType, InputValue, Workflow } from "@finsemble/finsemble-ui/react/types/workflowTypes";
import { ContentTypeDetecter } from "./contentTypeDetecter/ContentTypeDetecter"
import { default as fdc3InstrumentSchema } from "./contentTypeDetecter/schema/instrument.schema.json";
import { default as fdc3ContextSchema } from "./contentTypeDetecter/schema/context.schema.json";



const contentTypeDetecter = new ContentTypeDetecter(['SEDOL', 'CUSIP', 'ISIN', 'FDC3CONTACT', 'FDC3CONTACTLIST', 'FDC3COUNTRY', 'FDC3INSTRUMENT', 'FDC3INSTRUMENTLIST', 'FDC3ORGANIZATION', 'FDC3PORTFOLIO', 'FDC3POSITION', 'JSON', 'CSV', 'NUMBER'])

const inputTypes = [
    {
        id: "tabDelimitedCSV",
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
        schemaURL: fdc3ContextSchema
    },
    {
        id: "STRING",
        name: "String",
        format: "text",
        validators: [],
        schemaURL: null
    }
];

const workflows = [
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
];

// {"type":"fdc3.order", {}}


const InitiateWorkflowComponet = (props: any) => {
    let data = {"type":"fdc3.instrument","name":"Apple","id":{"ticker":"aapl","ISIN":"US0378331005","CUSIP":"037833100","FIGI":"BBG000B9XRY4"}}

    let [autofocusTab, setAutofocusTab] = useState<0 | 1>(0)
    let [inputValue, setInputValue] = useState<string>("")
    let [selectInputId, setSelectInputId] = useState<string>("")

    useEffect(() => {
        let spawndata = FSBL.Clients.WindowClient.getSpawnData()
        if (spawndata.mode == 'clipboard') {
            setAutofocusTab(0)
            FSBL.System.Clipboard.readText((clipboardData: string) => {
                setSelectInputId(contentTypeDetecter.detect(clipboardData))
                // console.log(JSON.parse(clipboardData))
                console.log(data)
                setInputValue(clipboardData)                // if(JSON.parse(clipboardData)){
                //     setInputValue(JSON.parse(clipboardData))
                // } else {
                //     setInputValue(clipboardData)
                // }
            })
        } else if (spawndata.mode == 'input') {
            setAutofocusTab(1)
        }
    }, [])

    const onClose = () => {
        console.log('onClose')
        FSBL.Clients.WindowClient.close({ removeFromWorkspace: true, closeWindow: true });
    }

    const onWorkflowInit: ExecuteWorkflow = (inputValue: InputValue, inputType: InputType, workflow: Workflow) => {
        console.log('onWorkflowInit')
        //finsembleWindow.hide();
        return { success: true, actionResults: [[{ success: true }]] }
    }

    return (
        <div id='InitiateWorkflow'>
            <InitiateWorkflow inputTypes={inputTypes} workflows={workflows} onClose={onClose} onWorkflowInit={onWorkflowInit} value={data} selectedInputId={selectInputId} autofocusTab={autofocusTab} />
        </div>
    );
};

export default InitiateWorkflowComponet

// const mapStateToProps = (state: any, ownProps: any) => {
//     return {}
// }

// const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
//     return {};
// };

// export default connect(
//     mapStateToProps,
//     mapDispatchToProps
// )(InitiateWorkflowComponet);