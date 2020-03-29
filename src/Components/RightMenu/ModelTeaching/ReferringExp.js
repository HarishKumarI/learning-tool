import React from 'react'
import $ from 'jquery'
import EditingPanel from './EditingPanel'

class ReferringExp extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            modelnodes_re: "",
            useprops: true,
            model_ref_exp: [],
            graph_ref_exp: []
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    generateOptions(data) {
        return data.map((node_name, index) => {
            return `<option key=${node_name}_${index} > ${node_name} </option>`
        }).join('')
    }

    componentDidMount() {
        $.get('/modelnodes', (data) => {
            document.getElementById('re_mn_suggestions').innerHTML = this.generateOptions(data.model_nodes)
        })
    }

    componentDidUpdate() {
        if (this.props.model_node !== "" && this.state.useprops) {
            this.setState({ modelnodes_re: this.props.model_node, useprops: false })
        }
    }

    handleClick(event) {
        event.preventDefault()
        // console.log(this.state)

        $.post('/saveRefExp', JSON.stringify({
            model_node: this.state.modelnodes_re,
            model_ref_exp: this.state.model_ref_exp,
            graph_ref_exp: this.state.graph_ref_exp
        }),
            (response, status) => {
                // console.log(response, status)
                this.setState({ modelnodes_re: "", model_ref_exp: [], graph_ref_exp: [] })
                this.props.msgFunc(response.msg, response.status)
                try {
                    this.props.recreated(true)
                }
                catch (error) {

                }
            })
            .fail(() => {
                this.props.msgFunc("Failed to Connect to server", 'Error')
            })
    }

    handleChange(event) {
        let { name, value } = event.target
        // console.log(name,value)
        event.preventDefault()
        if (name === "modelnodes_re") {
            $.post('/referringExp', JSON.stringify({ 'model_node': value }), (response, status) => {
                this.setState({ ...response })
            })
        }

        this.setState({ [name]: value, useprops: false })
    }

    render() {
        return (
            <div className="container">
                <form>
                    <div className="form-group">
                        <label htmlFor="modelnodes"> Model Nodes List </label>
                        <input list='re_mn_suggestions' type="text" className="form-control modelnodes_re" placeholder="Search for Model Node" name="modelnodes_re" value={this.state.modelnodes_re || ''} onChange={this.handleChange} onKeyUp={this.handleChange} />
                        <datalist id='re_mn_suggestions'>
                        </datalist>
                    </div>

                    <div className="form-group">
                        <label htmlFor=""> Model Keywords </label>
                        <EditingPanel
                            wordsList={this.state.model_ref_exp}
                            name="Keyword for Model"
                            updateList={(newwordlist, newword) => { this.setState({ model_ref_exp: newwordlist }) }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor=""> Graph Keywords </label>
                        <EditingPanel
                            wordsList={this.state.graph_ref_exp}
                            name="Keyword for Graph"
                            updateList={(newwordlist, newword) => { this.setState({ graph_ref_exp: newwordlist }) }}
                        />
                    </div>

                    <input name="save" className="btn btn-primary float-right" type="button" value="Save" onClick={this.handleClick} />
                    <br />
                </form>
                <br />
            </div>
        )
    }
}

export default ReferringExp