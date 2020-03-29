import React from 'react'
import $ from 'jquery'
import EditingPanel from './EditingPanel'



class Trigger extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            triggers_data: {},
            trigger: "",
            synonyms: [],
            synset: "",
            newtrigger: false
        }

        this.handleChange = this.handleChange.bind(this)
        this.updateList = this.updateList.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    generateOptions(data) {
        return data.map((node_name, index) => {
            return `<option key=${node_name}_${index} > ${node_name} </option>`
        }).join('')
    }


    componentDidMount() {
        $.get('/triggersData', (data) => {
            this.setState({ triggers_data: data })
            document.getElementById('triggers_sugg').innerHTML = this.generateOptions(Object.keys(data))
        })
    }

    handleChange(event) {
        const { name, value } = event.target
        // if (event.keyCode === 13) {

            if (Object.keys(this.state.triggers_data).includes(value)) {
                const { synonyms } = this.state.triggers_data[value]
                this.setState({ synonyms: synonyms })
            }
            else {
                let temp_list = this.state.triggers_data
                temp_list[value] = { synonyms: [], new_synonyms: [], synset: "" }
                this.setState({ synonyms: [], triggers_data: temp_list })
            }
        // }

        this.setState({ [name]: value })
    }

    updateList(wordsList, newword) {

        let temp_list = this.state.triggers_data
        let { synonyms, new_synonyms } = temp_list[this.state.trigger]

        if( newword !== "" )
            new_synonyms.push(newword)
        new_synonyms = Array(...new Set(new_synonyms))


        synonyms = synonyms.filter( x => !new_synonyms.includes(x) )

        temp_list[this.state.trigger].new_synonyms = new_synonyms
        temp_list[this.state.trigger].synonyms = synonyms

        this.setState({ synonyms: wordsList, triggers_data: temp_list })
    }

    handleClick(event) {
        event.preventDefault()

        let temp_list = this.state.triggers_data
        temp_list[this.state.trigger].synset = this.state.synset
        this.setState({ triggers_data: temp_list })

        // console.log(this.state.triggers_data)
        
        $.post('/savetriggers', JSON.stringify(this.state), (response) => {
            this.setState({trigger: "",synonyms: [], synset: "", newtrigger: false})
            console.log(response)
            this.props.msgFunc(response.msg,response.status)
        })
        .fail(() => {
            this.props.msgFunc("Failed to Connect to server",'Error')
        })
    }

    render() {

        return (
            <div className="container" >
                <form >
                    <div className="form-group" style={{ display: (!this.state.newtrigger) ? 'block' : 'none' }} >
                        <label htmlFor="modelnodes">Triggers </label>
                        <input list='triggers_sugg' type="text" className="form-control" placeholder="Search for Trigger" name="trigger" id="trigger" value={this.state.trigger || ''} onChange={this.handleChange} onKeyUp={this.handleChange} />
                        <datalist id='triggers_sugg'>
                        </datalist>
                    </div>

                    <div className="form-group" style={{ display: (this.state.newtrigger) ? 'block' : 'none' }}>
                        <label htmlFor="synset" > Trigger</label>
                        <input type="text" className="form-control" name="trigger" placeholder="Enter trigger" onKeyUp={this.handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="synonyms"> Synonyms </label>
                        <EditingPanel
                            wordsList={this.state.synonyms}
                            name="synonyms"
                            updateList={this.updateList}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="synset" > Synset</label>
                        <input type="text" className="form-control" name="synset" placeholder="Enter Synset" onKeyUp={this.handleChange} />
                    </div>

                    <input name="triggers_add" className="btn btn-primary float-left"
                        type="button" value={(this.state.newtrigger) ? 'Use Existing' : 'Add Trigger'}
                        onClick={(event) => { event.preventDefault(); this.setState({ newtrigger: !this.state.newtrigger, trigger: '', synonyms: [], synset: "" }) }} />

                    <input name="triggers_save" className="btn btn-primary float-right" type="button" value="Save" onClick={this.handleClick} />
                    <br />
                </form>
                <br />
            </div>
        )
    }
}

export default Trigger