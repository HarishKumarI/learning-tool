import React from 'react'
import $ from 'jquery'

class NlgTemplate extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            nlg_data: {},
            relation: "",
            newrelation: false,
            default: "",
            not_working: "",
            scrape_failed: ""
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
        $.get('/NlgData', (data) => {
            this.setState({ nlg_data: data })
            // console.log(this.state.nlp_data)
            document.getElementById('relation_sugg').innerHTML = this.generateOptions(Object.keys(data))
        })
    }

    handleChange(event) {
        const { name, value } = event.target
        if (name === 'relation') {
            event.preventDefault()
            if (this.state.newrelation) {
                let temp_Data = this.state.nlg_data
                temp_Data[value] = { default: "", disabled: "" }
                this.setState({ nlg_data: temp_Data, default: "", not_working: "", scrape_failed: "" })
            }
            else
                this.setState({ ...this.state.nlg_data[value] })
        }

        this.setState({ [name]: value })
    }

    handleClick(event) {
        event.preventDefault()

        let temp_list = this.state.nlg_data

        if (this.state.not_working !== "" || this.state.scrape_failed !== "") {
            temp_list[this.state.relation] = {
                default: this.state.default,
                not_working: this.state.not_working,
                scrape_failed: this.state.scrape_failed
            }
        }
        else {
            temp_list[this.state.relation] = {
                default: this.state.default,
                disabled: this.state.default
            }
        }

        this.setState({ nlg_data: temp_list, relation: "", default: "", disabled: "", not_working: "", scrape_failed: "",newrelation: false })
        $.post('/savenlgdata', JSON.stringify({ nlg_data: temp_list }), (response) => {
            // console.log(response)
            this.props.msgFunc(response.msg, response.status)

        })
            .fail(() => {
                this.props.msgFunc("Failed to Connect to server", 'Error')
            })

    }

    render() {

        return (
            <div className="container" >
                <form >
                    <div className="form-group" style={{ display: (this.state.newrelation) ? 'none' : 'block' }}>
                        <label htmlFor="modelnodes">Relation </label>
                        <input list='relation_sugg' type="text" className="form-control" placeholder="Search for Relation" name="relation" id="relation" value={this.state.relation} onChange={this.handleChange} onKeyUp={this.handleChange}/>
                        <datalist id='relation_sugg'>
                        </datalist>
                    </div>

                    <div className="form-group" style={{ display: (this.state.newrelation) ? 'block' : 'none' }}>
                        <label htmlFor="modelnodes">Relation </label>
                        <input type="text" className="form-control" placeholder="Enter Relation" name="relation" value={this.state.relation} onChange={this.handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="default"> Default Template </label>
                        <input type="text" className="form-control" name="default" placeholder="Enter default template" value={this.state.default} onChange={this.handleChange} />
                    </div>

                    {/* <div className="form-group">
                        <label htmlFor="disabled"> Disabled Template </label>
                        <input type="text" className="form-control" name="disabled" placeholder="Enter disabled template" value={this.state.disabled} onChange={this.handleChange} />
                    </div> */}

                    <div className="form-group">
                        <label htmlFor="not_working"> Not Working Template </label>
                        <input type="text" className="form-control" name="not_working" placeholder="Enter not working template" value={this.state.not_working} onChange={this.handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="scrape_fasiled"> Scrape failed Template </label>
                        <input type="text" className="form-control" name="scrape_failed" placeholder="Enter Scrape Failed template" value={this.state.scrape_failed} onChange={this.handleChange} />
                    </div>

                    <input name="triggers_add" className="btn btn-primary float-left"
                        type="button" value={(this.state.newrelation) ? 'Use Existing' : 'Add Relation'}
                        onClick={(event) => { event.preventDefault(); this.setState({ newrelation: !this.state.newrelation, relation: '', default: "", not_working: "", scrape_failed: "" }) }} />


                    <input name="key_save" className="btn btn-primary float-right" type="button" value="Save" onClick={this.handleClick} />
                    <br />
                </form>
                <br />
            </div>
        )
    }
}


export default NlgTemplate