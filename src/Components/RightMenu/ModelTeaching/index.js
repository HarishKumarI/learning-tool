import React from 'react'
import Trigger from './Trigger'
import Keywords from './Keywords'
import ReferringExp from './ReferringExp'
import NlgTemplate from './NlgTemplate'
import GraphTool from './GraphTool'
import $ from 'jquery'


class TeachModel extends React.Component {

    render() {

        return (
            <div >

                What is the issue?

                <div className="accordion" id="accordionExample">
                    <div className="card">
                        <div className="card-header" id="headingOne">
                            <h2 className="mb-0">
                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                    Keywords
                            </button>
                            </h2>
                        </div>

                        <div id="collapseOne" className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                            <div className="card-body">
                                <Keywords
                                    msgFunc={this.props.msgFunc}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header" id="headingTwo">
                            <h2 className="mb-0">
                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                    Referring Expression
                            </button>
                            </h2>
                        </div>
                        <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
                            <div className="card-body">
                                <ReferringExp
                                    msgFunc={this.props.msgFunc}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header" id="headingThree">
                            <h2 className="mb-0">
                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                    Triggers
                            </button>
                            </h2>
                        </div>
                        <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                            <div className="card-body">
                                <Trigger
                                    msgFunc={this.props.msgFunc}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header" id="headingfour">
                            <h2 className="mb-0">
                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapsefour" aria-expanded="false" aria-controls="collapsefour">
                                    NLG Template
                            </button>
                            </h2>
                        </div>
                        <div id="collapsefour" className="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                            <div className="card-body">
                                <NlgTemplate
                                    msgFunc={this.props.msgFunc}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header" id="headingfive">
                            <h2 className="mb-0" onClick={() => { document.getElementById('ModelBox').style.visibility = 'visible'; }}>
                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapsefive" aria-expanded="false" aria-controls="collapsefive" >
                                    Graph Tool
                            </button>
                            </h2>
                        </div>
                        <div id="collapsefive" className="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                            <div className="card-body">
                                <GraphTool
                                    msgFunc={this.props.msgFunc}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button style={{ marginTop: 20 + 'px' }} className="btn btn-success"
                    onClick={() => {
                        $.post('http://115.111.97.194:7209/train', {}, (response, status) => {
                            // console.log(response, status)
                            this.props.msgFunc("Referring Expression Model Trained Successfully",status)
                        })
                    }}
                >
                    Train Model
                </button>

            </div>
        )
    }
}

export default TeachModel