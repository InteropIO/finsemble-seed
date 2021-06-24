import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { InitiateWorkflow } from '@finsemble/finsemble-ui/react/components/InitiateWorkflow/InitiateWorkflow'
import { ExecuteWorkflow, InputType, InputValue, Workflow } from "@finsemble/finsemble-ui/react/types/workflowTypes";
import { ContentTypeDetecter } from "./contentTypeDetecter/ContentTypeDetecter"
import { inputTypes } from "./InputTypes"

const contentTypeDetecter = new ContentTypeDetecter(['SEDOL', 'CUSIP', 'ISIN', 'FDC3CONTACT', 'FDC3CONTACTLIST', 'FDC3COUNTRY', 'FDC3INSTRUMENT', 'FDC3INSTRUMENTLIST', 'FDC3ORGANIZATION', 'FDC3PORTFOLIO', 'FDC3POSITION', 'JSON', 'CSV', 'NUMBER'])

const testWorkflows = [
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


const InitiateWorkflowComponet = (props: any) => {
    let [autofocusTab, setAutofocusTab] = useState<0 | 1>(0)
    let [inputValue, setInputValue] = useState<any>()
    let [selectInputId, setSelectInputId] = useState<string>("")
    let [workflows, setWorkflows] = useState([])
    let workflowStore;

    useEffect(() => {
        console.log(inputTypes)
        let spawndata = FSBL.Clients.WindowClient.getSpawnData()
        if (spawndata.mode == 'clipboard') {
            setAutofocusTab(0)
            FSBL.System.Clipboard.readText((clipboardData: string) => {
                let contentType = contentTypeDetecter.detect(clipboardData)
                console.log("clipboardData: ", clipboardData, 'Type: ', contentType)

                setSelectInputId(contentType)
                if(contentType === 'CSV')
                    setInputValue(contentTypeDetecter.csvToArray(clipboardData))
                else
                    setInputValue(clipboardData)

                // setTimeout(()=>{
                //     setInputValue(clipboardData)
                // },2000)
            })
        } else if (spawndata.mode == 'input') {
            setAutofocusTab(1)
        }
        FSBL.Clients.DistributedStoreClient.getStore({ store: "WorkflowStore" }, (err, store) => {
            if(err){
                FSBL.Clients.Logger.error("Failed to get WorkflowStore", err)
            } else {
                workflowStore = store
                console.log(workflowStore)
                workflowStore.getValue('workflows', (err, value)=>{
                    setWorkflows(value)
                })
            }
        })

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
            <InitiateWorkflow inputTypes={inputTypes} workflows={workflows} onClose={onClose} onWorkflowInit={onWorkflowInit} value={inputValue} selectedInputId={selectInputId} autofocusTab={autofocusTab} />
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