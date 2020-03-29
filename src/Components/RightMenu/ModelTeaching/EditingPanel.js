import React from 'react'


let color_palette = ["#f3fe7e", "#f1f0d1", "#fffbbe", "#ffeadb", "#ffaaa5", "#f09872", "#e0f9b5", "#f09872", "#eec2c2", "#f6da63"]


class EditingPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            wordsList: this.props.wordsList,
            newword: "",
            editableindex: undefined
        }

        this.handleClick = this.handleClick.bind(this)
        this.handleKey = this.handleKey.bind(this)
    }

    componentDidUpdate() {
        if (this.state.wordsList !== this.props.wordsList)
            this.setState({ wordsList: this.props.wordsList })
    }

    handleClick(event, word, index) {
        const { className } = event.target

        if (className === 'content') {
            this.setState({ newword: word, editableindex: index })
        }
        else if (className === 'close_btn') {
            let cur_words = this.state.wordsList
            cur_words.splice(index, 1)
            this.setState({ wordsList: cur_words, newword: '', editableindex: undefined })
        }
    }

    handleKey(event) {
        let { name, value } = event.target
        if (event.keyCode === 13) {

            let temp_words = this.state.wordsList
            if (this.state.editableindex === undefined) {
                temp_words.push(this.state.newword)
            }
            else {
                temp_words[this.state.editableindex] = this.state.newword
            }
            value = ''
            this.setState({ wordsList: temp_words, editableindex: undefined })
            try{
                this.props.updateList(temp_words, this.state.newword)
            }
            catch{

            }
        }

        this.setState({ [name]: value })
    }

    render() {
        let words = this.state.wordsList.map((word, index) => {
            const bgcolor = color_palette[index % color_palette.length]
            if (word === '')
                return ''

            return <li key={index} style={{ backgroundColor: bgcolor, color: 'black' }} >
                <i className="content" onClick={(e) => this.handleClick(e, word, index)} > {word} </i>
                <i className="close_btn" onClick={(e) => this.handleClick(e, word, index)} >&times;</i>
            </li>
        })

        if( words.length === 0 )
            words = [<li key={0} style={{ backgroundColor:'transparent', color: 'white',border: 'none' }} > Empty List </li>]


        return (
            <div style={{ width: 100 + '%', height: 'auto'}}>
                <input type="text" className="form-control new_word" placeholder={`Enter New ${this.props.name}`} name="newword"  value={this.state.newword || ''} onChange={this.handleKey} onKeyUp={this.handleKey} />
                <small style={{ color: 'white', fontSize: 'xx-small' }}> Type and Press Enter to Add </small>

                <ul className="words" id="words">
                    {(this.state.newword === '') ? '' :
                        <div >
                            <li key={-1} style={{ backgroundColor: "orange", color: 'black' }}>  {this.state.newword}  </li>
                            <hr style={{ backgroundColor: '#464444' }} />
                        </div>
                    }
                    {words}
                </ul>
            </div>
        )
    }
}

export default EditingPanel