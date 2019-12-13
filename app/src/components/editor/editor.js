import axios from 'axios';
import React, { Component } from 'react';

class Editor extends Component {

    constructor(props){
        super(props);

        this.state = {
            pageList:[],
            newPageName:"",
        }

        this.createNewPage = this.createNewPage.bind(this);
      
    }

    componentDidMount(){
        this.loadPageList();
    }

    loadPageList(){
        axios
        .get('./api')
        .then( res => {
            this.setState({
                pageList: res.data,
            })
        })
    }

    createNewPage(){
        axios
        .post('./api/createNewPage.php',{
            "name":this.state.newPageName,
        })
        .then( this.loadPageList())
    }



    render() {
        
        const { pageList } = this.state;
        const  pages = pageList.map( (page, i) => {
            return (
                <h1 key={i}>{page}</h1>
            );
        });

        return (
            <>
                <input type="text" 
                onChange={ (event) => {
                    this.setState({
                        newPageName:event.target.value,
                    })
                }}/>
                <button onClick={this.createNewPage}>Create page</button>
                {pages}
            </>
        );
    }
}

export default Editor;

