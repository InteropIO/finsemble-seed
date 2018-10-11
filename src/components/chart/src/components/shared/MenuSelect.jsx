/**
 * React popup menu implementation
 * @module components/shared/MenuSelect
 */

import React from 'react'
import PropTypes from 'prop-types'

/**
 * React popup menu resuseable component
 *
 * @class MenuSelect
 * @extends {React.Component}
 */
class MenuSelect extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            menuOpen: false,
            hasButtons: props.hasButtons,
            hasCheckboxes: props.hasCheckboxes,
            selected: props.selected
				}

        this.toggleMenu = this.toggleMenu.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.selectOption = this.selectOption.bind(this);
    }
    toggleMenu(open){
        this.setState({ menuOpen: open })
    }
    edit(option, event){
        event.stopPropagation();
        this.props.editItem(option);
    }
    delete(option, event){
        event.stopPropagation();
        this.props.deleteItem(option);
    }
    selectOption(ciq, option){
				let oldOption = this.state.selected;
        this.setState({
            menuOpen: false,
            selected: option
        }, () => {
            //Call handleOptionSelect when the option selected has actually changed, ignore this when selecting '+ New Theme' from the theme menu
            if ((oldOption !== option) || (oldOption.type && option.type && oldOption.type !== option.type && oldOption.label && option.label && oldOption.label !== option.label) || (option.name && option.name.indexOf('New Theme')>-1)){
                if (Object.keys(ciq).length > 0){
                    this.props.handleOptionSelect(ciq, option);
                } else {
                    this.props.handleOptionSelect(option);
                }
            }
        });
    }
    render(){
				if(this.props.options.length===0) { return (<div></div>); }

        let options = this.props.options.map((option, i) => {
            let onSelect = this.props.needsCiq ? this.selectOption.bind(this, this.props.ciq, option) : this.selectOption.bind(this, {}, option),
            optionLabel = this.props.name ? option[this.props.name] : (this.props.labelNeedsTransform ? this.props.labelTransform(option) : option),
            buttonCName = (this.state.selected && option === this.state.selected) ? 'ciq-checkbox ciq-active' : 'ciq-checkbox',
						select = (this.state.hasCheckboxes ? this.selectOption.bind(this, {}, option, true) : onSelect);

            return (
                <menu-option key={'menuSelectOption' + this.props.keyName + i} onClick={select}>
                    {(this.state.hasButtons && (this.props.noButtons.indexOf(optionLabel)===-1))
                                ?
                        (<span>
                        <span className='ciq-edit' onClick={this.edit.bind(this, option)}></span>
                        <cq-close onClick={this.delete.bind(this, option)}></cq-close></span>)
                                :
                                null
                    }
                    {this.state.hasCheckboxes
                                ?
                        (<div><span className={buttonCName}><span></span></span></div>)
                                :
                                null
                    }
                    {optionLabel}
                </menu-option>
            );
        });

        let menuDisplay = {
            display: this.state.menuOpen ? 'block' : 'none'
        };

        return (
            <menu-select id={this.props.menuId} onMouseLeave={this.toggleMenu.bind(this, false)} onClick={this.toggleMenu.bind(this, !this.state.menuOpen)}>
                <span className='title'>{this.props.title}</span>
                <menu-select-options className='ps-container' style={menuDisplay}>
                    {options}
                </menu-select-options>
            </menu-select>
        );
    }
}

MenuSelect.defaultProps = {
    hasButtons: false,
    options: [],
    noButtons: [],
    needsCiq: false,
    labelNeedsTransform: false,
    keyName: 'option'
};

MenuSelect.propTypes = {
    options: PropTypes.array.isRequired,
    keyName: PropTypes.string.isRequired,
    menuId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    hasButtons: PropTypes.bool.isRequired,
    deleteItem: PropTypes.func,
    editItem: PropTypes.func,
    labelNeedsTransform: PropTypes.bool,
    labelTransform: PropTypes.func,
    needsCiq: PropTypes.bool,
    ciq: PropTypes.object,
    noButtons: PropTypes.array
};

export default MenuSelect
