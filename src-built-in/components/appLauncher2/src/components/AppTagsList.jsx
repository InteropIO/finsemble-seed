import React from 'react'

import storeActions from '../stores/StoreActions';

export default class AppTagsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            highlightedTag: -1
        };
        this.highlightTag = this.highlightTag.bind(this);
        this.clearHighlights = this.clearHighlights.bind(this);
        this.generateTags = this.generateTags.bind(this);
    }

    highlightTag(index) {
        this.setState({
            highlightedTag: index
        });
    }

    clearHighlights() {
        this.setState({
            highlightedTag: -1
        });
    }

    generateTags() {
        let { highlightedTag:highlight } = this.state;

        let tags = this.props.tags.map((tag, i) => {
            let style = highlight === i ? "tag-name highlight" : "tag-name";
            return (
                <span key={i} className={style} onClick={storeActions.addTag.bind(this, tag)} onMouseEnter={this.highlightTag.bind(this, i)} onMouseLeave={this.clearHighlights}>
                    {this.props.tags[i + 1] ? `${tag}, ` : `${tag}`}
                </span>
            );
        });

        return tags;
    }

    render() {
        return (
            <div className="app-item-tags">
                <i className="ff-tag"></i>
                {this.generateTags()}
            </div>
        )
    }
}