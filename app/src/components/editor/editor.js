import '../../helpers/iframeLoader.js';
import axios from 'axios';
import React, { Component } from 'react';

class Editor extends Component {

    constructor(props){
        super(props);

        this.currentPage = "index.html";

        this.state = {
            pageList:[],
            newPageName:"",
        }

        this.createNewPage = this.createNewPage.bind(this);
        
      
    }

    componentDidMount(){
       this.init(this.currentPage);
    }

    init(page){
        this.iframe = document.querySelector('iframe');
        this.open(page);
        this.loadPageList();
    }

    open(page){
        this.currentPage = page;

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then( res =>this.parseStrToDOM(res.data))
            .then(this.wrapTextNodes)
            .then( dom => {
                this.virtualDom = dom;
                return dom;
            })
            .then(this.serializeDOMtoString)
            .then(html => axios.post(`./api/saveTempPage.php`,{html}))
            .then(()=> this.iframe.load("../temp.html"))
            .then(()=>this.enableEditing())
            
    }

    save(){
        const newDom = this.virtualDom.cloneNode(this.virtualDom);
        this.unwrapTextNodes(newDom);
        const html = this.serializeDOMtoString(newDom);
        axios
        .post("./api/savePage.php",{pageName:this.currentPage,html})
    }

    enableEditing(){
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach( element => {
            element.contentEditable = "true";
            element.addEventListener("input", () => {
                this.onTextEdit(element);
            })
        });
    }
    
    onTextEdit(element){
        const id = element.getAttribute("nodeid");
        this.virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
    }

    parseStrToDOM(str){
        const parser = new DOMParser;
        return parser.parseFromString(str, "text/html");
    }


    wrapTextNodes(dom){
        const body = dom.body;
        let textNodes = [];

        function recurcy(element){
            element.childNodes.forEach( node => {
               
                if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g,"").length > 0){
                    textNodes.push(node);
                }else{
                    recurcy(node);
                }
            });
        };

        recurcy(body);

        textNodes.forEach( (node, i) => {
            const wrapper = dom.createElement('text-editor');
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
           wrapper.setAttribute("nodeid", i);
        });

        return dom; 
    }

    serializeDOMtoString(dom){
        const serializer = new XMLSerializer()
        return serializer.serializeToString(dom);
    }

    unwrapTextNodes(dom){
        dom.body.querySelectorAll("text-editor").forEach( element => {
            element.parentNode.replaceChild(element.firstChild, element);
        });
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
        .catch( () => {
            alert("Page already added")
        })
    }

    deletePage(page){
        axios
        .post("./api/deletePage.php",{
            "name":page,
        })
        .then( this.loadPageList())
        .catch( () => {
            alert("Page not founded")
        })
    }



    render() {
        
        // const { pageList } = this.state;
        // const  pages = pageList.map( (page, i) => {
        //     return (
        //         <h1 key={i}>
        //             {page}
        //             <a href="#"
        //             onClick={() => this.deletePage(page)}>(x)</a>
        //         </h1>
        //     );
        // });

        return (
            <>
            <button onClick={()=> this.save()}>Click</button>
            <iframe src={this.currentPage} frameBorder="0"></iframe>
                {/* <input type="text" 
                onChange={ (event) => {
                    this.setState({
                        newPageName:event.target.value,
                    })
                }}/>
                <button onClick={this.createNewPage}>Create page</button>
                {pages} */}
            </>
        );
    }
}

export default Editor;

