//request multiselect values

//render the multiselect with values

//set multiselect size to fit... need max size...
// $(function () {
//     $("#multiSelect").attr("size",$("#multiSelect option").length);
//  });
 
 //if no selection disable the button

 //on selection enable the button

 //send selection back to the desktop agent

 //close me


 import React from "react";
 import ReactDOM from "react-dom";
 import "../intentResolverModal.css";
 import "../../../../../assets/css/font-finance.css";
 import "../../../../../assets/css/finsemble.css";
 import { FinsembleDialog } from "@chartiq/finsemble-react-controls";


 /**
 * 
 *
 * @class IntentResolverModal
 * @extends {React.Component}
 */
class IntentResolverModal extends React.Component {
  constructor(props) {
    super(props);
	let self = this;
	console.log("Did you get here?");
    this.bindCorrectContext();
    self.state = {
      componentList: [],
      affirmativeResponseLabel: 'Yes',
      negativeResponseLabel: 'No',
      cancelResponseLabel: 'Cancel Action'
    };
    this.selectorRef = React.createRef();
		document.body.addEventListener("keydown", this.handleKeydownOnBody);
  }

  bindCorrectContext() {
		this.handleKeydownOnBody = this.handleKeydownOnBody.bind(this);
		this.onShowRequested = this.onShowRequested.bind(this);
		this.componentDidMount = this.componentDidMount.bind(this);
		this.setButtonText = this.setButtonText.bind(this);

		this.intentResolverModal = this.intentResolverModal.bind(this);
		this.generateSelect = this.generateSelect.bind(this);
		this.noIntentModal = this.noIntentModal.bind(this);
		this.setCloseHandler = this.setCloseHandler.bind(this);
  }

  setCloseHandler() {
	FSBL.Clients.RouterClient.addListener("Close_dialog", () => {
		FSBL.Clients.WindowClient.close();
	});
}
  setButtonText() {
		//Need an If to check if there are any targets. If no targets Affirmative should say close
			this.setState({
				affirmativeResponseLabel: 'Raise Intent'
			});
	}

	getHandler(spawnData){
		console.log("getMySpawnDataComponentListHere:", spawnData);
		debugger;
	}

  componentDidMount() {
	//   debugger;
	//   this.getTargets();
	  this.setButtonText();
	  this.setCloseHandler();
	  let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	  console.log("spawnData", spawnData);
	//   debugger;
	  let handler = this.getHandler(spawnData)
	  if(handler === "intent"){
		//   this.get
	  }
    self.setState({
	//   componentList: spawnData.componentList
	componentList: ["Welcome Component"]
    });
  }


	/**
	 * Handles escape and enter.
	 *
	 * @param {any} e
	 * @memberof IntentResolverModal
	 */
	handleKeydownOnBody(e) {
		if (e.code === "Enter" && e.shiftKey === false) {
			this.affirmativeAction();
		}

		if (e.code === "Escape") {
			this.cancelAction();
		}
	}

  	/**
	 * When the opener requests that the dialog show itself, it also passes in initialization data. This function grabs that data, calls setState, and then fits the window to the contents of the DOM. Then we call `showDialog`, which will display the dialog on the proper monitor.
	 *
	 * @param {any} err
	 * @param {any} response
	 * @memberof IntentResolverModal
	 */
	onShowRequested(err, response) {
		FSBL.Clients.Logger.debug("onShowRequested", response.data);
		this.fitAndShow();
	}
	/**
	 * Fits the contents of the DOM to the openfin window, then calls `showDialog`, which positions the dialog on the proper monitor and toggles the visiblity of the window.
	 *
	 * @memberof IntentResolverModal
	 */
	fitAndShow() {
		FSBL.Clients.WindowClient.fitToDOM(null, function () {
			FSBL.Clients.DialogManager.showDialog();
		});
	}

	cancelAction() {
		FSBL.Clients.WindowClient.close();
	}


  affirmativeAction() {
    //DO STUFF WHEN I SUBMIT
  }


  /**
	 * Helper function to generate the DOM for the pull modal
	 * @memberof IntentResolverModal
	 * @returns {<FinsembleDialog>} Finsemble Dialog with DOM nodes related to the pull functionality
	 */
	intentResolverModal() {
      let spawnData = FSBL.Clients.WindowClient.getSpawnData();
    //   let intentsFragment = [];
    //   spawnData.componentList.forEach((sec, i) => {
    //     intentsFragment.push(
    //       <div className="security-item" key={i}>
    //         {sec}
    //       </div>);
    //   });
      return (<FinsembleDialog
        behaviorOnResponse="close"
        onShowRequested={this.onShowRequested}
        isModal={true}>
        <div className="content-main-wrapper">
          <div className="header-wrapper">
            <div className="content-section-header">Select Intent</div>
            <div className="content-section-header">Selected Intent</div>
          </div>
          <div className="content-main-row">
            <div className="content-main-column templates-column">
              <div className="template-list">
                {this.generateSelect()}
                {/* <div className="intents-wrapper">
                  {intentsFragment}
                </div> */}
              </div>
            </div>
          </div>
          <div className="action-buttons-wrapper">
            <button
              onClick={() => this.cancelAction()}
              className="action-button">
              {this.state.cancelResponseLabel}
            </button>
            <button
              onClick={() => this.affirmativeAction()}
              className="action-button affirmative-button">
              {this.state.affirmativeResponseLabel}
            </button>
          </div>
        </div>
      </FinsembleDialog>
      )
    }
  
  /**
	 * Helper function to generate the DOM for the pull modal
	 * @memberof IntentResolverModal
	 * @returns {<FinsembleDialog>} Finsemble Dialog with DOM nodes related to the pull functionality
	 */
	noIntentModal() {
		return (
			<FinsembleDialog
				behaviorOnResponse="close"
				onShowRequested={this.onShowRequested}
				isModal={true}>
				<div className="content-main-wrapper">
					<div className="header-wrapper">
						<div className="content-section-header">No Available Targets</div>
					</div>
					<div className="content-main-row">
					</div>
					<div className="action-buttons-wrapper">
						<button
							onClick={() => this.cancelAction()}
							className="action-button">
							{this.state.cancelResponseLabel}
						</button>
						<button
							onClick={() => this.affirmativeAction()}
							className="action-button affirmative-button">
							{this.state.affirmativeResponseLabel}
						</button>
					</div>
				</div>
			</FinsembleDialog>
		)
	}

  generateSelect() {
		let container = [];
		this.state.componentList.forEach((component, i) => {
			let baseClass = "target-item template-item ";
			let classNames = baseClass;
			container.push(
				<option className={classNames} key={i}>
					{component}
				</option>
			);
		});
		console.log("ComponentList Container", container);
		debugger;
		return (
			<select size="4" ref={this.selectorRef} className="select-target">
				{container}
			</select>
		)
	}

  render () {
    // const { components } = self.state;

    // let componentList = components.length > 0
    // 	&& components.map((item, i) => {
    //   return (
    //     <option key={i} value={item.componentType}>{item.componentType}</option>
    //   )
    // }, self);

    // return (
    //   <div>
    //     <select>
    //       {componentList}
    //     </select>
    //   </div>
    // );

    self = this;
    // if(this.state.componentList)
    return this.intentResolverModal();
  }
}

// export default IntentResolver;

//render component when Finsemble is ready.
if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FinsembleReady); } else { window.addEventListener("FinsembleReady", FinsembleReady) }
function FinsembleReady() {
	ReactDOM.render(
		<IntentResolverModal />
		, document.getElementById("intentResolver-component-wrapper"));
}