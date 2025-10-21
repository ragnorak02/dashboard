import COUNTER_STYLES from './counter.scss';
// import COUNTER_TEMPLATE from './counter.tpl.html';


export default class COUNTER extends HTMLElement {

    constructor() {

        super();
        this._connected = false;
        this.attachShadow({ mode: 'open' });
        this._state = {
            sCount: null,
            sTitle: null,
            sSubTitle: null
        }

        this.oPropsToStateNames = {
            "title": "sTitle",
            "sub-title": "sSubTitle",
            "count": "sCount"
        }

        this.nNumberDisplay = null;


    }

    get style() {
        return `<style>${COUNTER_STYLES}</style>`;
    }

    get template() {
        return `
        <div class="counter">
            <div class="title">
                <header part="counter-header">
                    <span class="title" part="title">${(this._state.sTitle) ? this._state.sTitle : ""}</span>
                    ${(this._state.sSubTitle) ? '<em class="sub-title" part="sub-title">' + this._state.sSubTitle + '</em>' : ""}
                </header>
            </div>
            <div class="count-wrapper" part="count-wrapper">
                <span class="count" part="count">${(this._state.sCount) ? this._state.sCount : "No Value"}</span>
            </div>
        </div>`;
    }
    get state() {
        let updatedState = {};
        for (let [key, value] of Object.entries(this.oPropsToStateNames)) {

            if (this._state[this.oPropsToStateNames[key]]) {
                updatedState[key] = this._state[this.oPropsToStateNames[key]];
            }
        }

        return updatedState
    }

    setState(props) {
        this._state = Object.assign(this._state, this.normalizeProps(props));

        if (this._connected) {
            this.render();
        }
    }

    normalizeProps(props) {
        let updatedProps = {};
        for (let [key, value] of Object.entries(props)) {
            if (this.oPropsToStateNames[key]) {
                updatedProps[this.oPropsToStateNames[key]] = value;
            }
        }
        return updatedProps;
    }
    populateStateFromAttributes() {
        if (this._state.sTitle == null) {
            this._state.sTitle = (this.hasAttribute('title')) ? this.getAttribute('title') : "";
        }
        if (this._state.sSubTitle == null) {
            this._state.sSubTitle = (this.hasAttribute('sub-title')) ? this.getAttribute('sub-title') : "";
        }
        if (this._state.sCount == null) {
            this._state.sCount = (this.hasAttribute('count')) ? this.getAttribute('count') : "";
        }

        if (!isNaN(this._state.sCount)) {

            this._state.sCount = parseInt(this._state.sCount).toLocaleString()
        }
        else {

            this._state.sCount = "Invalid Number";
        }
    }
    connectedCallback() {

        this._connected = true;
        this.populateStateFromAttributes();
        this.render();


    }

    render() {

        this.shadowRoot.innerHTML = `${this.style}${this.template}`;
        this.slotElements();

    }

    // changeCountColor() {
    //     //works for hard coded counters
    //     let dCounter = document.querySelectorAll('cui-counter');
    //     let oNumberDisplay = document.querySelectorAll('.number-display')
    //     //  dCounter.setAttribute('style', "border:2px solid orange")
    //     console.log(dCounter)
    //     let sTextElement;
    //     // let nNumberDisplay;
    //     for (let number of dCounter) {
    //         sTextElement = number.querySelector('[slot="number-display"]');
    //         // nNumberDisplay = Number(number.querySelector('[slot="number-display"]').textContent);
    //         // console.log(number.shadowRoot.textContent);

    //         // if (nNumberDisplay < 50) {
    //         //     // console.log('color is red')
    //         //     sTextElement.setAttribute('style', 'color:#f21d1d');
    //         // } else {
    //         //     // console.log('color is green')
    //         //     sTextElement.setAttribute('style', 'color:#25fa05');
    //         // }

    //     }

    //     // let dCounter = document.querySelectorAll('cui-counter');
    //     // let nCount;
    //     // let sTextElement;
    //     // // console.log(dCounter, 'counting')
    //     // for (let number of dCounter){
    //     //     //   sTextElement = number.querySelector('.counter').textContent;
    //     //     //  sTextElement = document.shadowRoot.querySelector('.counter');
    //     //     nCount = Number(number.getAttribute('count'));
    //     //     console.log(nCount, number, this._state.sCount,'the numbers as a number');
    //     // }
    //     // if(nCount <50){

    //     // }

    // }


    appendCount() {
        //the dynamically created count
        let sCount = document.createElement('div');
        sCount.textContent = this._state.sCount;
        sCount.slot = "number-display";
        let nNumber = Number(sCount.textContent);

        if(nNumber <50){
            sCount.setAttribute('style', 'color:#f21d1d');
        } else if (50<nNumber || nNumber<100){
            sCount.setAttribute('style', 'color:#f5f111')
        }else{
            sCount.setAttribute('style', 'color:#e3433b')
        }

           
        // console.log(nNumber, 'counting, needs to be all');

        this.appendChild(sCount);
    }

    appendTitle() {
        let sTitle = document.createElement('div');
        sTitle.textContent = this._state.sTitle;
        sTitle.slot = "title"
        this.appendChild(sTitle);
    }

    appendSubTitle() {
        let sSubTitle = document.createElement('div');
        sSubTitle.textContent = this._state.sSubTitle;
        sSubTitle.slot = "sub-title"
        this.appendChild(sSubTitle);
    }

    slotElements() {
        if (this._state.sTitle) {
            this.appendTitle();
        }
        if (this._state.sSubTitle) {
            this.appendSubTitle();
        }

        if (this._state.sCount) {
            this.appendCount();
        }

    }
}

