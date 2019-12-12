import axios from 'axios';
import React, { Component } from 'react';

class Editor extends Component {

    constructor(props){
        super(props);

        this.state = {
            pageList:[],
            newPageName:"",
        }
    }

    render() {
        return (
            <>
                <input type="text" />
                <button>Create page</button>
            </>
        );
    }
}

export default Editor;

