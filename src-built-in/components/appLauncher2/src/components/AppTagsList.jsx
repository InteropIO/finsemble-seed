import React from 'react'

export default class AppTagsList extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const tags = this.props.tags
        return (
            <div className="app-item-tags">
                {
                    tags.map((tag, index) => {
                        return <span key={index}>
                            {tags[index + 1] ? `${tag}, ` : `${tag}`}
                        </span>
                    })
                }
            </div>
        )
    }
}