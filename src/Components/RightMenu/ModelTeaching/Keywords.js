import React from 'react'
import $ from 'jquery'
import EditingPanel from './EditingPanel'

class Keywords extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modelnodes_key: "",
            graph_nodes: "",
            keywords: [],
            useprops: true
        }

        this.generateOptions = this.generateOptions.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        $.get('/modelnodes', (data) => {
            document.getElementById('keyw_mn_suggestions').innerHTML = this.generateOptions(data.model_nodes)
        })
    }

    componentDidUpdate() {
        if (this.props.model_node !== "" && this.state.useprops) {
            this.setState({ modelnodes_key: this.props.model_node, graph_nodes: this.props.graphnode, useprops: false })
        }
    }

    handleClick(event) {
        event.preventDefault()

        $.post('/saveKeywords', JSON.stringify({ 'filename': this.state.graph_nodes, 'keywords': this.state.keywords }),
            (response, status) => {
                // console.log(response.msg, status)
                this.setState({ keywords: []})
                this.props.msgFunc(response.msg, response.status)
                try {
                    this.props.keywordcreated(true, this.state)
                }
                catch (err) {

                }
            })
            .fail(() => {
                this.props.msgFunc("Failed to Connect to server", 'Error')
            })

    }

    generateOptions(data) {
        return data.map((node_name, index) => {
            return `<option key=${node_name}_${index} > ${node_name} </option>`
        }).join('')
    }

    handleChange(event) {
        let { name, value } = event.target
        event.preventDefault()

        if (name === "modelnodes_key") {
            $.post('/graphnodes', JSON.stringify({ 'model_node': value }), (response, status) => {
                document.getElementById('keyw_gn_suggestions').innerHTML = this.generateOptions(response.key_nodes)
            })
        }
        else if (name === "graph_nodes") {
            if (value !== "")
                $.post('/keywords', JSON.stringify({ 'graph_node': value }), (response, status) => {
                    this.setState({ ...response })
                })
        }

        this.setState({ [name]: value,useprops: false })
    }

    render() {

        return (
            <div className="container">
                <form >
                    <div className="form-group">
                        <label htmlFor="modelnodes"> Model Nodes List </label>
                        <input list='keyw_mn_suggestions' type="text" className="form-control" placeholder="Search for Model Node" name="modelnodes_key" value={this.state.modelnodes_key || ''} onChange={this.handleChange} onKeyUp={this.handleChange} />
                        <datalist id='keyw_mn_suggestions'>
                        </datalist>
                    </div>

                    <div className="form-group">
                        <label htmlFor="graph_nodes"> Graph Nodes </label>
                        <input list='keyw_gn_suggestions' type="text" className="form-control" placeholder="Search for Graph Node" name="graph_nodes" value={this.state.graph_nodes || ''} onChange={this.handleChange} onKeyUp={this.handleChange} />
                        <datalist id='keyw_gn_suggestions'>
                        </datalist>
                    </div>

                    <div className="form-group">
                        <label htmlFor="keywords"> Keywords </label>
                        <EditingPanel
                            wordsList={this.state.keywords || []}
                            name="Keyword"
                            updateList={(newwordlist, newword) => { this.setState({ keyword: newwordlist }) }}
                        />
                    </div>

                    <input name="key_save" className="btn btn-primary float-right" type="button" value="Save" onClick={this.handleClick} />
                    <br />
                </form>
                <br />
            </div>

        )
    }
}

export default Keywords