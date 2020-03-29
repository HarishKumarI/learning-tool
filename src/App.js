import React from 'react'
import ReactDOM from 'react-dom'
import './App.css'
import $ from 'jquery'
import { css } from "@emotion/core"
import GridLoader from "react-spinners/GridLoader"
import RightMenu from './Components/RightMenu'
import { Button } from 'semantic-ui-react'
import Showmsg from './Components/Showmsg'

let colors = {
  'not_reviewed': '#5b5656',
  'reviewed': '#B4BD7F',
  'done': '#5b8c5a',
  '': '#5b5656'
}



function Title(props) {
  return (
    <div className="Title">
      <div className="main_title">University QA</div>
      <div style={{ padding: "20px", margin: "5px", fontSize: '19px' }}>You can ask me questions about Library.</div>
    </div>
  );
}


class BoxComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { box_title: props.box_title, box_value: props.box_value };
  }

  render() {

    return (
      <div>
        <div className="q_current">
          {this.state.box_title}
        </div>

        <div className="abox">
          {this.state.box_value}
        </div>
      </div>
    );
  }
}

class AnsComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { box_title: props.box_title, box_value: props.box_value };
  }

  render() {

    var rows = [];
    const mystyle = {
      textAlign: "left",
      lineHeight: "1.5em",
      fontSize: "20px",
      padding: "10px 20px",
    };
    for (var i = 0; i < this.state.box_value.length; i++) {
      if (i >= 3)
        break;
      if (i === 0 || (i === 1 && this.state.box_value[0].length === 0)) {
        rows.push(<div key={i}>
          <p style={mystyle}>{this.state.box_value[i]}</p>
        </div>);
      }
      else {
        rows.push(<div key={i}>
          <p style={{ textAlign: "left", padding: "10px 20px" }}>{this.state.box_value[i]}</p>
        </div>);
      }
    }

    return (
      <div>
        <div className="q_current">
          {this.state.box_title}
        </div>

        <div className="abox">
          {rows}
        </div>
      </div>
    );
  }
}

class PredComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { box_title: props.box_title, box_value: props.box_value };
  }

  render() {

    var rows = [];
    const mystyle = {
      textAlign: "left",
      lineHeight: "1.5em",
      fontSize: "18px",
      padding: "10px 20px",
    };
    for (var i = 0; i < this.state.box_value.length; i++) {
      if (i >= 3)
        break;
      var preds = JSON.stringify(this.state.box_value[i]).replace(/['"]+/g, '');
      if (i === 0 || (i === 1 && this.state.box_value[0].length === 0)) {

        rows.push(<div key={i}>
          <p style={mystyle}>{preds}</p>
        </div>);
      }
      else {
        rows.push(<div key={i}>
          <p style={{ textAlign: "left", padding: "10px 20px" }}>{preds}</p>
        </div>);
      }
    }

    return (
      <div>
        <div className="q_current">
          {this.state.box_title}
        </div>

        <div className="abox">
          {rows}
        </div>
      </div>
    );
  }
}

class NudgeComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { box_title: props.box_title, nudge_dict: props.nudge_dict, action: props.action };
  }

  handleNudge(question) {
    this.state.action(question);
  }

  render() {
    const head_style = {
      textAlign: "left",
      lineHeight: "1.5em",
      fontSize: "20px",
      padding: "10px 20px",
      color: "#2ecc71",
      marginBottom: "4px"
    };
    const topic_style = {
      color: "#3498db",
      marginBottom: "8px"
    };
    // console.log(this.state.nudge_dict);
    var rows = [];

    rows.push(<div key={-1} style={head_style}> You might be interested in : </div>);

    for (let [node, node_dict] of Object.entries(this.state.nudge_dict)) {
      //console.log(node, node_dict);

      rows.push(<div key={rows.length} style={head_style}>{node_dict.node_name}</div>);
      var count = 0;
      for (let [rel, rel_dict] of Object.entries(node_dict.rel_dict)) {
        if (rel_dict.rel_list.length !== 0) {
          count += 1;
          rows.push(<div key={rows.length} style={{ textAlign: "center" }}>
            <div style={topic_style}> {rel_dict.rel_name} </div>
            <div>
              {rel_dict.rel_list.map((node, index) => (
                <Button key={index} basic inverted color="teal" value={node} onClick={e => this.handleNudge(e.target.value)}
                  style={{ fontSize: "12px", margin: "5px", padding: "9px" }}> {node} </Button>
              ))}
            </div>
          </div>);
        }
      }

      if (count === 0) {
        rows.pop();
      }

    }

    if (rows.length === 1) {
      rows.pop();
    }

    return (
      <div>
        <div className="q_current">
          {this.state.box_title}
        </div>

        <div className="abox">
          {rows}
        </div>
      </div>
    );
  }
}


class QAComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { current_q: '', answer_json: {}, user_info: { name: 'John' }, show_abox: false, loading: false };
    this.requestServer = this.requestServer.bind(this);
  }

  requestServer(question, question_info = "") {
    if (question.length > 0) {
      this.setState(state => ({
        loading: !state.loading,
        show_abox: false,
        current_q: question
      }));
      let q_request = {
        question: question,
        user_info: this.state.user_info
      };
      $.post('/', JSON.stringify(q_request), (response) => {
        this.setState({ ...response, show_abox: true, loading: !this.state.loading });
        $('#qbox_1').val('');

        if (question_info !== "") {
          question_info.answer_json = response.answer_json
        }

      }, 'json');
    }
  }

  componentDidUpdate() {
    if (this.state.current_q !== this.props.question_info.question && !this.props.qeuEntered) {
      this.requestServer(this.props.question_info.question, this.props.question_info)
    }
  }

  // componentDidMount() {
  //   if (this.state.current_q !== this.props.question_info.question && !this.props.qeuEntered) {
  //     this.requestServer(this.props.question_info.question)
  //   }
  // }

  handleKeyDown(e, nudge = false) {

    // console.log(e.keyCode);
    if (e.keyCode === 13 || nudge) {

      let question = $.trim(e.target.value);
      this.props.qeuEnteredChange()
      this.requestServer(question);
    }
  }

  getBoxes() {
    // console.log(this.state.answer_json);
    return (
      <div>
        <AnsComponent box_title={this.state.current_q} box_value={this.state.answer_json.answer} />
        {/* <NudgeComponent box_title='NUDGES' nudge_dict={this.state.answer_json.nudge_dict} action={this.requestServer} />
        <PredComponent box_title='NODE_PREDS' box_value={this.state.answer_json.ref_exp_nodes} />
        <PredComponent box_title='VALID_PREDS' box_value={this.state.answer_json.response} />
        <PredComponent box_title='PREDS' box_value={this.state.answer_json.pred_tuples} /> */}
        {/*<BoxComponent box_title='NOT_PRESENT_IN_ASSOC_TABLES' box_value={this.state.answer_json.failed_assoc_prob_list}/>
       <BoxComponent box_title='MODEL_RAW_OUTPUT' box_value={this.state.answer_json.res_dict}/> */}
        <PredComponent box_title='MODEL_INFERRED_OUTPUT' box_value={this.state.answer_json.results} />
      </div>
    );
  }

  render() {

    const override = css`
        display: block;
        margin: 100px;
        border-color: red;
        `;

    let boxes = null;

    if (this.state.show_abox === true) {
      boxes = this.getBoxes();
    }

    return (
      <div className='qa_container'>
        {(this.props.qeuEntered) ? '' : <p style={{ color: 'white', fontSize: 20 + 'px' }}>{`Question ${this.props.QueNoData.cur_idx + 1} / ${this.props.QueNoData.total}  `}</p>}

        <input list='suggestions' type="text" name="question" id="qbox_1" className="qbox" onChange={(e) => this.setState({ show_abox: false })} onKeyDown={(e) => this.handleKeyDown(e)} />
        <datalist id='suggestions'>
          <option value="Does the library have a mac?" />
          <option value="Where can i get color print?" />
          <option value="How to reserve a group study space" />
          <option value="illiad" />
          <option value="When does the library open on Friday?" />
          <option value="What are the library fines for lost items?" />
        </datalist>
        <GridLoader
          css={override}
          size={15}
          color={"silver"}
          loading={this.state.loading}
        />
        {boxes}



      </div>);
  }
};

class QCButtons extends React.Component {

  getbutton(text, selector, specialstyle = {}) {
    const style = {
      borderRadius: 0,
      width: 130 + 'px',
      backgroundColor: (this.props.que_status !== selector) ? '' : colors[selector],
      color: (this.props.que_status !== selector) ? 'white' : 'black',
      ...specialstyle
    }

    return (
      <button className="btn btnsmenu"
        style={style}
        onClick={(event) => { event.preventDefault(); this.props.updateStatus(event, selector) }}
      >
        {text}
      </button>
    )
  }

  render() {

    return (
      <div className="qc_btns">
        <div className="qc_buttons">

          <button className="btn btn-dark float-left"
            onClick={(event) => { this.props.Qchangefun(event, -1) }}
          >Previous</button>

          {this.getbutton("Not Reviewed", 'not_reviewed', { borderTopLeftRadius: 5 + 'px', borderBottomLeftRadius: 5 + 'px' })}
          {this.getbutton("Reviewed", 'reviewed')}
          {this.getbutton("Done", 'done', { borderTopRightRadius: 5 + 'px', borderBottomRightRadius: 5 + 'px' })}


          <button className="btn btn-dark float-right"
            onClick={(event) => { this.props.Qchangefun(event, 1) }}
          >Next</button>
        </div>

      </div>
    )
  }
}


class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      quesData: [],
      q_index: 0,
      filter: "",
      quesEntered: false,
      msgdisplay: { bool: false, value: "", type: "" }
    }

    this.handleChange = this.handleChange.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
    this.updateQarray = this.updateQarray.bind(this)
  }

  componentDidMount() {
    $.get('/QuesData', (response) => {
      this.setState({ quesData: response.data })
    })
  }

  updateQarray(q_array) {
    this.setState({ quesData: q_array, q_index: 0 })
  }

  handleChange(event, increament) {
    event.preventDefault()
    this.setState({ quesEntered: false })
    const new_qno = this.state.q_index + increament
    if (new_qno >= 0 && new_qno !== this.state.quesData.length)
      this.setState({ q_index: new_qno })
  }


  updateStatus(event, status) {
    event.preventDefault()
    this.setState({ msgdisplay: { bool: false, value: "", type: "" } })

    let temp_que_data = this.state.quesData
    temp_que_data[this.state.q_index].status = status

    $.post('/saveQuesData', JSON.stringify({ oldQues: '', newQues: temp_que_data }), (response) => {
      // console.log(response)
      this.setState({ msgdisplay: { bool: true, value: "Question Status Updated Successfully", type: "success" } })
    })

    this.setState({ quesData: temp_que_data })
  }

  render() {


    return (
      <div className="App">
        <div className="title_container">
          <Title />
        </div>
        {(this.state.quesData !== {}) ?
          <QAComponent
            question_info={this.state.quesData[this.state.q_index]}
            qeuEntered={this.state.quesEntered}
            QueNoData={{ cur_idx: this.state.q_index, total: this.state.quesData.length }}
            qeuEnteredChange={() => { this.setState({ quesEntered: true }) }}
          />
          : ''
        }


        <RightMenu
          QueData={this.state.quesData}
          setQno={(event, qno) => { event.preventDefault(); this.setState({ q_index: qno }) }}
          updateQues={this.updateQarray}
          msgFunc={(msgValue, type) => { this.setState({ msgdisplay: { bool: false, value: "", type: "" } });
                setTimeout(() => { this.setState({ msgdisplay: { bool: true, value: msgValue, type: type } }) }, 30) 
              }}
        />


        {(this.state.quesData[this.state.q_index] !== undefined) ?
          <QCButtons
            Qchangefun={this.handleChange}
            updateStatus={this.updateStatus}
            que_status={this.state.quesData[this.state.q_index].status}
          />
          : ''
        }

        {
          (this.state.msgdisplay.bool) ? <Showmsg msgData={this.state.msgdisplay} /> : ""
        }

      </div >
    );
  }
}

export default App;
