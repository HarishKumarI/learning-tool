import React from 'react'


class Showmsg extends React.Component {
    constructor(props){
        super(props)

        this.state ={
            msgList: [{type:"",value:""}],
            index: 0
        }

        this.length = this.state.msgList.length
    }

    componentDidMount(){
        // console.log(this.state)
        let temp_list = this.state.msgList
        temp_list.push( this.props.msgData )
        this.setState({ msgList: temp_list})
    }

    componentDidUpdate(){
        // console.log(this.length)
    }

    render() {

        this.colors = {
            'success': 'rgba(135, 189, 135, 0.8)',
            'Warning': "rgba(236,197,87,0.8)",
            "Error": "rgba(245,72,72,0.88)"
        }

        return (
            <div id="messageBox" style={{ backgroundColor: this.colors[this.state.msgList[this.state.msgList.length -1].type] }}>
                {this.state.msgList[this.state.msgList.length -1].value}
            </div>
        )
    }
}

export default Showmsg