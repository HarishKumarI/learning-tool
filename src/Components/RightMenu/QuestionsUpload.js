import React from 'react'

import { Form, Button } from 'semantic-ui-react'
import $ from 'jquery'

let colors = {
    'not_reviewed': '#5b5656',
    'reviewed': '#B4BD7F',
    'done': '#5b8c5a',
    '': '#5b5656'
}


class QuestionsUpload extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            questions_data: [],
            temp_qs: [],
            showtemp: false,
            btnText: "Upload Questions File",
            filter: ""
        }

        this.fileInputRef = React.createRef()
        this.fileupload = this.fileupload.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }


    componentWillUnmount() {
        this.setState({ questions_data: [] })
    }

    componentWillMount() {
        if (this.state.questions_data !== this.props.QueData) {
            this.setState({ questions_data: this.props.QueData })
        }
    }

    componentDidUpdate() {
        if (this.state.questions_data !== this.props.QueData) {
            this.setState({ questions_data: this.props.QueData })
        }
    }


    fileupload(event) {
        event.preventDefault()
        document.getElementById('mainrgtmenu').style.display = "inline-block"

        const file = event.target.files[0]

        var reader = new FileReader();
        reader.onload = () => {
            let questionsString = reader.result
            const queslist = questionsString.split('\n')
            let questionsData = []

            queslist.forEach(question => {
                questionsData.push({
                    question: question,
                    answer_json: {},
                    status: "not_reviewed"
                })
            })
            this.setState({ temp_qs: questionsData, btnText: file.name, showtemp: true })
        }
        reader.readAsText(file)
    }


    handleClick(event) {
        event.preventDefault()
        const { name } = event.target

        if (name === 'true') {
            this.props.updateQues(this.state.temp_qs)
            this.setState({ questions_data: this.state.temp_qs })

            $.post('/saveQuesData', JSON.stringify({ oldQues: this.state.questions_data, newQues: this.state.temp_qs }), (response) => {
                console.log(response)
                this.props.msgFunc(response.msg, response.status)
            })
                .fail(() => {
                    this.props.msgFunc("Failed to Connect to server", 'Error')
                })

        }

        this.setState({ temp_qs: [], btnText: "Upload Questions File", showtemp: false })
    }

    render() {

        // if (this.state.questions_data !== this.props.QueData) {
        //     this.setState({ questions_data: this.props.QueData })
        // }

        let status_info = {
            'not_reviewed': 0,
            'reviewed': 0,
            'done': 0
        }

        let questions =
            ((this.state.showtemp) ? this.state.temp_qs : this.state.questions_data).map((question_info, qno) => {
                const status = question_info.status

                status_info[status] += 1

                if (this.state.filter === '' || status === this.state.filter)
                    return <li key={qno} style={{ backgroundColor: colors[status] }} onClick={(event) => this.props.setQno(event, qno)}
                        title={`Query for "${String(question_info.question)}"`}
                    >
                        {`${qno + 1}. \xa0 ${String(question_info.question)}`}
                    </li>
                else
                    return ''
            })

        if (status_info[this.state.filter] === 0)
            questions = <li key="0" style={{ backgroundColor: colors[this.state.filter] }}> Empty list for Questions Marked as {this.state.filter} </li>

        return (
            <div className="questionsUpload">
                <div >
                    <h3> Upload New Quesitons </h3>
                    <form >
                        <Form.Group className="formgroup">
                            <Button
                                content={this.state.btnText}
                                labelPosition="left"
                                icon="file" className="file_button"
                                onClick={(e) => { e.preventDefault(); this.fileInputRef.current.click() }}
                            />
                            <input
                                ref={this.fileInputRef}
                                type="file"
                                hidden
                                onChange={this.fileupload}
                            />
                            <br />
                            <small style={{ fontSize: 9 + 'px' }} >Questions Should be in new line in the file</small>

                        </Form.Group>
                        <div style={{ marginTop: 10 + "px", textAlign: "center", display: (this.state.showtemp) ? "block" : " none" }}>
                            check on these Questions ?
                            <input type="button" name="true" className="btn btn-success ml-3" value="Yes" onClick={this.handleClick} />
                            <input type="button" name="false" className="btn btn-danger ml-3" value="No" onClick={this.handleClick} />
                        </div>

                    </form>
                </div>
                <hr style={{ backgroundColor: '#676767', width: 90 + '%' }} />
                <h4 > {(this.state.showtemp) ? "New" : ""} Questions </h4>
                <Button.Group >
                    <Button compact style={{ padding: 2 + 'px', paddingTop: 10 + 'px', paddingBottom: 10 + 'px', width: 125 + 'px', backgroundColor: colors['not_reviewed'] }}
                        content={`Not Reviewed (${status_info['not_reviewed']})`} title={`Click to display Questions marked as "not reviewed" `}
                        onClick={(event) => { event.preventDefault(); if (this.state.filter === "not_reviewed") this.setState({ filter: '' }); else this.setState({ filter: "not_reviewed" }) }} />

                    <Button compact style={{ padding: 2 + 'px', paddingTop: 10 + 'px', paddingBottom: 10 + 'px', width: 125 + 'px', backgroundColor: colors['reviewed'] }}
                        content={`Reviewed (${status_info['reviewed']})`} title={`Click to display Questions marked as "reviewed" `}
                        onClick={(event) => { event.preventDefault(); if (this.state.filter === "reviewed") this.setState({ filter: '' }); else this.setState({ filter: "reviewed" }) }} />

                    <Button compact style={{ padding: 2 + 'px', paddingTop: 10 + 'px', paddingBottom: 10 + 'px', width: 125 + 'px', backgroundColor: colors['done'] }}
                        content={`Done (${status_info['done']})`} title={`Click to display Questions marked as "done" `}
                        onClick={(event) => { event.preventDefault(); if (this.state.filter === "done") this.setState({ filter: '' }); else this.setState({ filter: "done" }) }} />

                </Button.Group>

                <div className="questions">
                    <ul>
                        {questions}
                    </ul>
                </div>
            </div>
        )
    }
}

export default QuestionsUpload