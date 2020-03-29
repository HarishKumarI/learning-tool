import React from 'react'
import $ from 'jquery'
import Keywords from './Keywords'
import ReferringExp from './ReferringExp'


class NodeCreation extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            modelnodesList: [],
            modelnode: "",
            nodeid: "",
            nodename: "",
            desc: "",
            parentnode: "",
            relation: ""
        }

        this.handleKey = this.handleKey.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        $.get('/modelnodes', (data) => {
            document.getElementById('mn_suggestions').innerHTML = this.generateOptions(data.model_nodes)
        })

        $.get('/allgraphnodes', (data) => {
            document.getElementById('pn_suggestions').innerHTML = this.generateOptions(data.graph_nodes)
        })

        $.get('/relations', (data) => {
            document.getElementById('rel_suggestions').innerHTML = this.generateOptions(data.relations)
        })
    }


    generateOptions(data) {
        return data.map((node_name, index) => {
            return `<option key=${node_name}_${index} > ${node_name} </option>`
        }).join('')
    }

    handleKey(event) {
        const { name, value } = event.target
        if (value === "")
            $(`#${name}error`).show()
        else
            $(`#${name}error`).hide()
        this.setState({ [name]: value })
    }

    handleClick(event) {
        event.preventDefault();

        let validationsuccess = true
        for (var key in this.state) {
            if (this.state[key] === "") {
                validationsuccess = false
                $(`#${key}error`).show()
            }
        }

        if (validationsuccess) {
            $.post('/createnode', JSON.stringify(this.state), (response) => {
                // console.log(response)
                this.props.msgFunc(response.msg, response.status)
                this.props.nodecreated(true, this.state)
            })
                .fail(() => {
                    this.props.msgFunc("Failed to Connect to server", 'Error')
                })
        }
    }

    render() {
        return (
            <div className="container">
                <form >
                    <div className="form-group">
                        <label htmlFor="modelnodes"> Model Nodes List </label>
                        <input list='mn_suggestions' type="text" className="form-control" placeholder="Search for Model Node" name="modelnode" onChange={this.handleKey} onKeyDown={this.handleKey} />
                        <datalist id='mn_suggestions'>
                        </datalist>
                        <small id="modelnodeerror" style={{ color: 'red' }}> Select Model Node</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nodeid"> Node Id </label>
                        <input type="text" className="form-control" name="nodeid" placeholder="Enter Node Id" onKeyUp={this.handleKey} />
                        <small id="nodeiderror" style={{ color: 'red' }}> Node Id should not Empty</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nodename"> Node Name </label>
                        <input type="text" className="form-control" name="nodename" placeholder="Enter Node Name" onKeyUp={this.handleKey} />
                        <small id="nodenameerror" style={{ color: 'red' }}> Node Name should not Empty</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="desc"> Description </label>
                        <input type="text" className="form-control" name="desc" placeholder="Enter Description" onKeyUp={this.handleKey} />
                        <small id="descerror" style={{ color: 'red' }}> Description should not Empty</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="modelnodes"> Parent Nodes List </label>
                        <input list='pn_suggestions' type="text" className="form-control" placeholder="Pick a Parent Node" name="parentnode" id="parentnode" onChange={this.handleKey} onKeyDown={this.handleKey} />
                        <datalist id='pn_suggestions'>
                        </datalist>
                        <small id="parentnodeerror" style={{ color: 'red' }}> Select Parent Node</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="modelnodes"> Relation List </label>
                        <input list='rel_suggestions' type="text" className="form-control" placeholder="Choose a Relation" name="relation" onChange={this.handleKey} onKeyDown={this.handleKey} />
                        <datalist id='rel_suggestions'>
                        </datalist>
                        <small id="relationerror" style={{ color: 'red' }}> Choose a Relation</small>
                    </div>

                    <input name="node_creation" className="btn btn-success float-right" type="button" value="Create Node" onClick={this.handleClick} />

                    <br />
                </form>
                <br />
            </div>
        )
    }
}

class GraphTool extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            formno: 0,
            totalforms: 3,
            showprev: false,
            shownext: false,
            nodedone: false,
            redone: false,
            keyworddone: false,
            nodeid: "",
            modelnode: "",
        }
    }


    closeCard(e) {
        let mouse = { x: e.clientX, y: e.clientY }
        let modelbox = document.getElementById('ModelBox')
        if (modelbox !== null) {
            const domrect = modelbox.getClientRects()[0]

            if (domrect !== undefined)
                if ((mouse.x < domrect.x || mouse.x > domrect.x + domrect.width) ||
                    (mouse.y < domrect.y || mouse.y > domrect.y + domrect.height)) {
                    modelbox.style.visibility = 'hidden'
                    document.getElementById('collapsefive').classList = ["collapse"]
                }
        }
    }

    plusform(no) {
        let temp_formno = this.state.formno + no

        if (temp_formno < this.state.totalforms) {
            for (let i = 0; i < this.state.totalforms; i++) {
                document.getElementById('form' + i).style.display = 'none'
            }

            document.getElementById('form' + temp_formno).style.display = 'block'
        }


        this.setState({ shownext: false,formno: temp_formno })
    }


    render() {
        // for closing Modal
        // window.addEventListener('click', (event) => { this.closeCard(event) })
        return (
            <div className="ModelBox" id="ModelBox">
                <span style={{ float: 'right', fontSize: 'xx-large', cursor: 'pointer' }}
                    onClick={() => { document.getElementById('ModelBox').style.visibility = 'hidden'; document.getElementById('collapsefive').classList = ["collapse"] }} title="Close">
                    &times;
                </span>


                <div className="steps">
                    <h3 style={{ marginLeft: 20 + 'px' }}> Steps </h3>
                    <ul className="progressbar">
                        <li className={`step ${(this.state.nodedone) ? 'step-complete step-active' : 'step-incomplete step-inactive'} `} >
                            <span className="step_icon"></span> <span className="step_label" >Create Node </span>
                        </li>
                        <li className={`step ${(this.state.redone) ? 'step-complete step-active' : 'step-incomplete step-inactive'} `} >
                            <span className="step_icon"></span> <span className="step_label" >Add Referring Expression </span>
                        </li>
                        <li className={`step ${(this.state.keyworddone)  ? 'step-complete step-active' : 'step-incomplete step-inactive'} `} >
                            <span className="step_icon"></span> <span className="step_label" >Add Keywords </span>
                        </li>
                    </ul>
                </div>

                <div className="forms">
                    <div id="form0" >
                        <NodeCreation
                            msgFunc={this.props.msgFunc}
                            nodecreated={(bool, stateObj) => { if (bool) this.setState({ nodedone: true, ...stateObj, shownext: true }) }}
                        />
                    </div>

                    <div id="form1" style={{ display: 'none' }}>
                        <ReferringExp
                            msgFunc={(msg, status) => this.props.msgFunc(msg + " Referring Expression", status)}
                            recreated={(bool) => { if (bool) this.setState({ redone: true, shownext: true }) }}
                            model_node={this.state.modelnode}
                        />
                    </div>


                    <div id="form2" style={{ display: 'none' }}>
                        <Keywords
                            msgFunc={(msg, status) => this.props.msgFunc(msg + ' Keywords', status)}
                            keywordcreated={(bool) => { if (bool) this.setState({ keyworddone: true,shownext: false }) }}
                            model_node={this.state.modelnode}
                            graphnode={this.state.nodeid}
                        />
                    </div>

                </div>

                <div style={{ color: '#rgba(108,234,108,0.85)',width: 100+'%', textAlign: 'center', fontSize: 'larger', display: ( this.state.keyworddone && this.state.nodedone && this.state.redone ) ? 'block' : 'none' }}>
                    Finished All The Steps
                </div>

                <div style={{ bottom: 10 + 'px', padding: '10px 10%', position: 'absolute', width: 97 + '%' }}>
                    {
                        (this.state.showprev) ?
                            < input type="button" id="prev" className="btn btn-primary float-left"
                                onClick={(event) => { this.plusform(-1) }}
                                value="Previous" />
                            : ''
                    }

                    {
                        (this.state.shownext) ?
                            <input type="button" id="next" className="btn btn-primary float-right"
                                onClick={(event) => { this.plusform(1) }}
                                value="Next" />
                            : ''}
                </div>
            </div >
        )
    }

}

export default GraphTool