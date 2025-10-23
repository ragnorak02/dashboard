import SLIDE_STYLES from './slide.scss';
// import TEST_OBJECT from './testObject2.json';


export default class SLIDE extends HTMLElement {
    static observedAttributes = ["active"];

    
    constructor() {

        super();
        this.attachShadow({ mode: 'open' });
        this._state = {
            sLayout: null,
            nDuration: null,
            sAction: null,
            sTitle: null,
            sFooter: null
        };

        this.oPropsToStateNames = {
            "duration": "nDuration",
            "layout": "sLayout",
            "title": "sTitle",
            "footer": "sFooter",
            "action": "sAction",
            "refreshRate": "nRefreshRate"
        }

    }

    get style() {
        return `<style>${SLIDE_STYLES}</style>`;
    }
    get title() {
        if (this._state.sTitle == "undefined" || this._state.sTitle == "" || this._state.sTitle == null) {
            return ` <div class="slide-title" part="slide-title"></div>`
        } else {
            return ` <div class="slide-title" part="slide-title">
                    <header class="header" part="header">
                        ${this._state.sTitle}
                    </header>
            </div>`
        }
    }

    //if QR code wants to get inserted or other footer info, menu of all slides...tree?
    get footer() {

        if (this._state.sFooter == "" || this._state.sFooter == "undefined" || this._state.sFooter == null) {
            return `<div class="slide-footer" part="slide-footer"></div>`
        } else {
            return `<div class="slide-footer" part="slide-footer">
                <footer class="footer" part="footer">
                    ${this._state.sFooter}
                </footer>
            </div>`
        }
    }

    get template() {

        let sSlideContainerStruct = null;

        switch (this._state.sLayout) {
            case "twoRow":
                sSlideContainerStruct = `
                <div class="row" part="row" part="row">
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents"> 
                            <slot name="top-row"></slot>
                        </div>
                    </div>
                </div>

                <div class="row" part="row" >
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="bottom-row"></slot>
                        </div>
                    </div>
                </div>`

                break;

            case "twoColumn":
                sSlideContainerStruct = `
                <div class="row" part="row">
                    <div class="col" part="col left-column-wrapper">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="left-column"></slot>
                        </div>
                    </div>
                    <div class="col" part="col right-column-wrapper">
                        <div class="slide-contents" part="slide-contents">
                        <slot name="right-column"></slot>
                        </div>
                    </div>
                </div> `

                break;

            case "oneByTwo":
                sSlideContainerStruct = `
                <div class="row" part="row" >
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="top-row"></slot>
                        </div>
                    </div>
                </div>
                <div class="row flex-row" part="row flex-row">
                    <div class="col" part="col bottom-left-column-wrapper">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="bottom-left-column"></slot>
                        </div>
                    </div>
                    <div class="col" part="col bottom-right-column-wrapper">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="bottom-right-column"></slot>
                        </div>
                    </div>
                </div>`

                break;

            case "twoByOne":
                sSlideContainerStruct = `
                <div class="row flex-row" part="row flex-row">
                    <div class="col" part="col top-left-column-wrapper">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="top-left-column"></slot>
                        </div>
                    </div>
                    <div class="col" part="col top-right-column-wrapper">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="top-right-column"></slot>
                        </div>
                    </div>
                </div>
                <div class="row" part="row" >
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="bottom-row"></slot>
                        </div>
                    </div>
                </div> `

                break;

            case "twoByTwo":
                sSlideContainerStruct = `
                <div class="row flex-row" part="row flex-row">
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="top-left-column"></slot>
                        </div>
                    </div>
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="top-right-column"></slot>
                        </div>
                    </div>
                </div>
                <div class="row flex-row" part="row flex-row">
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="bottom-left-column"></slot>
                        </div>
                    </div>
                    <div class="col" part="col">
                        <div class="slide-contents" part="slide-contents">
                            <slot name="bottom-right-column"></slot>
                        </div>
                    </div>
                </div>`

                break;

            //case "": <== Removing because blank or any unkonwn value in general should just yeild the default setting
            default:
                sSlideContainerStruct = `
                <div class="row" part="row">
                    <div class="col" part="col">
                        <slot name="default-content"></slot>
                    </div>
                </div>`

                break;
        }

        return `<div class="slide" id="default" part="outer-wrapper">
                    <div class="inner-wrapper" part="inner-wrapper">
                        ${this.title}
                        <div class="slide-content-wrapper" part="slide-content-wrapper">
                            ${sSlideContainerStruct}
                        </div>
                        ${this.footer}
                    </div>
                </div> `

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
        for (let [key, value] of Object.entries(this.aoTestObject)) {
            if (this.oPropsToStateNames[key]) {
                updatedProps[this.oPropsToStateNames[key]] = value;

            }
        }
        return updatedProps;
    }

    render() {
        this.shadowRoot.innerHTML = `${this.style}${this.template}`;

        this.slotElements();
    }

    connectedCallback() {
        this._connected = true;
        this.populateStatesFromAttributes();
        this.render();

    }

    populateStatesFromAttributes() {

        if (this._state.nDuration == null) {
            this._state.nDuration = (this.hasAttribute('duration')) ? this.getAttribute('duration') : "";
        }

        if (this._state.sLayout === null) {
            this._state.sLayout = (this.hasAttribute('layout')) ? this.getAttribute('layout') : "";
        }

        if (this._state.sTitle === null) {
            this._state.sTitle = (this.hasAttribute('title')) ? this.getAttribute('title') : "";
        }
        if (this._state.sFooter === null) {
            this._state.sFooter = (this.hasAttribute('footer')) ? this.getAttribute('footer') : "";
        }

        if (this._state.sAction === null) {
            this._state.sAction = (this.hasAttribute('action')) ? this.getAttribute('action') : "";
        }

    }

    // JAH These functions are all unique, so they dont add anything as being functions. Its better to inline them into the template as your template login allowes it.
    get twoRow() {}
    get twoColumn() {}
    get oneByTwo() {}
    get twoByOne() {}
    get twoByTwo() {}

    slotElements() {
        if (this._state.sTitle) {
            this.appendTitle();
        }

        if (this._state.sFooter) {
            this.appendFooter();
        }
    }

    appendTitle() {
        let sTitle = document.createElement('div');
        sTitle.textContent = this._state.sTitle;
        sTitle.slot = "titleContents";
        this.appendChild(sTitle);
    }
    appendFooter() {
        let sFooter = document.createElement('div');
        sFooter.textContent = this._state.sFooter;
        sFooter.slot = "footerContents";
        this.appendChild(sFooter);
    }

    emitRefreshSlideEvent() {
        if (this._state.sAction) {
            const E_REFRESH = new CustomEvent('refresh', {
                bubbles: true,
                coomposed: true,
                detail: {
                    target: this,
                    value: this.getAttribute('action')
                }
            });
            this.dispatchEvent(E_REFRESH);
        }
    }

}
