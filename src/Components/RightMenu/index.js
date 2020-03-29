import React from 'react'
import './RightMenu.css'
import QuestionsUpload from './QuestionsUpload'
import TeachModel from './ModelTeaching'

class RightMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            componentName: "",
            cardOpen: false
        }

        this.setQno = this.setQno.bind(this)
        this.OpenComponent = this.OpenComponent.bind(this)
    }

    setQno(event, qno) {
        event.preventDefault()

        this.setState({ componentName: '', cardOpen: false });
        document.getElementById('mainrgtmenu').style.display = "none"
        this.props.setQno(event, qno)
    }

    OpenComponent(event, changeComp) {
        event.preventDefault()

        if (!this.state.cardOpen) {
            document.getElementById('mainrgtmenu').style.display = "inline-block"
        }
        else if (changeComp === this.state.componentName) {
            document.getElementById('mainrgtmenu').style.display = "none"
        }
        this.setState({ componentName: changeComp, cardOpen: !this.state.cardOpen })
    }

    closeCard(e) {
        let mouse = { x: e.clientX, y: e.clientY }
        let rgtmenudom = document.getElementById('mainrgtmenu')
        if (rgtmenudom.style.display === "inline-block") {
            const domrect = rgtmenudom.getClientRects()[0]
            const menurect = document.getElementById('menu-list').getClientRects()[0]
            if ((mouse.x >= 0 && mouse.x < domrect.x) &&
                !(mouse.x > menurect.x && mouse.x < domrect.x &&
                    mouse.y > menurect.y && mouse.y < menurect.y + menurect.height))
                rgtmenudom.style.display = "none"
        }
    }

    render() {
        let menuComponent = ""
        switch (this.state.componentName) {
            case "QuestionsUpload":                
                menuComponent = <QuestionsUpload
                    QueData={this.props.QueData}
                    setQno={(event, qno) => { this.setQno(event, qno) }}
                    updateQues={this.props.updateQues}
                    msgFunc={this.props.msgFunc}
                />
                break;
            case "IssueCorrection":
                menuComponent = <TeachModel
                    msgFunc={this.props.msgFunc}
                />
                break
            default:
                menuComponent = <QuestionsUpload
                    QueData={this.props.QueData}
                    setQno={(event, qno) => { this.setQno(event, qno) }}
                    updateQues={this.props.updateQues}
                    msgFunc={this.props.msgFunc}
                />
                break;
        }

        // for closing sideMenu
        // window.addEventListener('click', this.closeCard) 

        return (
            <div className="rightMenu" >
                <div id="menu-list">
                    {/* <div key="GitLogin"> Git </div> */}
                    <div key="QuestionsUpload" onClick={(event) => this.OpenComponent(event, "QuestionsUpload")} > Questions Upload</div>
                    <div key="IssueCorrection" onClick={(event) => this.OpenComponent(event, "IssueCorrection")} >Teach the Model</div>
                    {/* <div className="logInfo" style={{ float: 'right' }} > Log Info </div> */}
                </div>

                <div id="mainrgtmenu">
                    {menuComponent}
                </div>

            </div>
        )
    }
}

export default RightMenu