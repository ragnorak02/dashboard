import SLIDE_STYLES from './slide.scss';
// import TEST_OBJECT from './testObject2.json';


export default class SLIDE extends HTMLElement {

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
            return ` <div class="slide-title" id="ribbon"></div>`
        } else {
            return ` <div class="slide-title" id="ribbon"><h3>${this._state.sTitle}</h3></div>`
        }
    }

    get footer() {
        if (this._state.sFooter == "" || this._state.sFooter == "undefined" || this._state.sFooter == null) {
            return `<div class="slide-footer"></div>`
        } else {
            return `<div class="slide-footer"><h4>${this._state.sFooter}</h4></div>`
        }
    }
    get template() {
        let sSlideBody =
            `
                <div class="slide" id="default" part="outer-wrapper">
                ${this.title}
                    ${this._state.sLayout}
                ${this.footer}
                </div>
               `
            ;

        switch (this._state.sLayout) {
            case "twoRow":
                return `
                <div class="slide" id="default" part="outer-wrapper">
                ${this.title}
                    ${this.twoRow}
                ${this.footer}
                </div>
            `
            case "twoColumn":
                return `
                <div class="slide" id="default" part="outer-wrapper">
                ${this.title}
                    ${this.twoColumn}
                ${this.footer}
                </div>
              `
            case "oneByTwo":
                return `
                <div class="slide" id="default" part="outer-wrapper">
                ${this.title}
                    ${this.oneByTwo}
                ${this.footer}
                </div>
            `
            case "twoByOne":
                return `
                <div class="slide" id="default" part="outer-wrapper">
                ${this.title}
                    ${this.twoByOne}
                ${this.footer}
                </div>
            `
            case "twoByTwo":
                return `
                <div class="slide" id="default" part="outer-wrapper">
                ${this.title}
                    ${this.twoByTwo}
                ${this.footer}
                </div>
            `
            case "":
                return `
                <div class="slide" id="default" part="outer-wrapper">
                ${this.title}
                    <div class="row">
                        <slot name="default-content">
                        </slot>
                    </div>
                ${this.footer}
                </div>
             `
        }

    }

    get layoutContent() {
        switch (this._state.sLayout) {
            case "toColumn":
                `${this.twoColumn}`
                break;
            case "twoRow":
                `${this.twoRow}`
                break;
            case "":
        };
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

    get twoRow() {
        return `

                    <div class="row" part="row-wrapper">
                        <div class="col">
                            <div class="slide-contents"> 
                                <slot name="top-row"></slot>
                            </div>
                        </div>
                    </div>

                    <div class="row" part="row-wrapper">
                        <div class="col">
                            <div class="slide-contents">
                                <slot name="bottom-row"></slot>
                            </div>
                        </div>
                    </div>

        `
    }
    get twoColumn() {
        return `

                    <div class="row">
                        <div class="col" part="column-wrapper">
                            <div class="slide-contents">
                                <slot name="left-column"></slot>
                            </div>
                        </div>
                        <div class="col" part="right-column-wrapper">
                            <div class="slide-contents">
                            <slot name="right-column"></slot>
                            </div>
                        </div>
                    </div>

           
            `

    }
    get oneByTwo() {
        return `

                    <div class="row" part="row-wrapper">
                            <div class="slide-contents">
                            <slot name="top-row"></slot>
                            </div>
                    </div>

                    <div class="row">
                        <div class="col" part="bottom-left-column-wrapper">
                            <div class="slide-contents">
                            <slot name="bottom-left-column">
                            </slot>
                            </div>
                        </div>
                        <div class="col" part="bottom-right-column-wrapper">
                            <div class="slide-contents">
                            <slot name="bottom-right-column">
                            </slot>
                            </div>
                        </div>
                    </div>
    
                `
    }
    get twoByOne() {
        return `

                <div class="row">
                    <div class="col" part="top-left-column-wrapper">
                        <div class="slide-contents">
                        <slot name="top-left-column"></slot>
                        </div>
                    </div>
                    <div class="col" part="top-right-column-wrapper">
                        <div class="slide-contents">
                        <slot name="top-right-column"></slot>
                        </div>
                    </div>
                </div>

                <div class="row" part="row-wrapper">
                        <div class="slide-contents">
                        <slot name="bottom-row"></slot>
                        </div>
                </div>

        `
    }
    get twoByTwo() {
        return `

                    <div class="row">
                        <div class="col">
                            <div class="slide-contents">
                                <slot name="top-left-column"></slot>
                            </div>
                        </div>
                        <div class="col">
                            <div class="slide-contents">
                                <slot name="top-right-column"></slot>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <div class="slide-contents">
                                <slot name="bottom-left-column"></slot>
                            </div>
                        </div>
                        <div class="col">
                            <div class="slide-contents">
                                <slot name="bottom-right-column"></slot>
                            </div>
                        </div>
                    </div>

            `
    }

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
