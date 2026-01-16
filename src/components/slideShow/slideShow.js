import SLIDE_SHOW_STYLES from './slideShow.scss';
// import SLIDE from './components/slide/slide.js';
// import TEST_OBJECT from './testObject.json';

export default class SLIDE_SHOW extends HTMLElement {
    #bRendered = false;

    #oState = {
        bAutomaticStart: true,
        adSlides: null,
        iDefaultTimer: 10000,

        iCurrentSlideIndex: null,
        iPreviousSlideIndex: null,

        sPlayState: "stopped",              // Current state of the slide show (started, stopped, paused)
        iCurrentSlideTimer: null,           // Total amount of time in milliseconds this slide should be showing
        iCurrentSlideElasped: null,         // Equals the current amount of milliseconds that has elasped

        // Timers
        vNextSlideProgressTimer: null,              // Current slide timer
        vSlideChangePendingTimer: null,     // Slide halfway mark timer
        vSlideProgressTimer: null           // Progress Timer update
    };

    constructor() {

        super();
        // this._connected = false;

        this.attachShadow({ mode: 'open' });

        this._state = {
            sLayout: null,
            nDuration: null,
            sAction: null,
            sTitle: null,
            sStop: null,
            sStart: null,
            sPause: null,
            sPlayState: "stopped",
        };

        this.oPropsToStateNames = {
            "duration": "nDuration",
            "layout": "sLayout",
            "title": "sTitle",
            "action": "sAction",
            "refreshRate": "nRefreshRate",
            "stop": "sStop",
            "start": "sStart",
            "pause": "sPause"
        }

        this.slideLayout = "";
        this.dSlides = null;
        this.iCycleCount = 0;
        this.numberOfCyclesBeforeRefresh = 2;

    }

    get style() {
        return `<style>${SLIDE_SHOW_STYLES}</style>`;
    }

    get template() {
        return `<div class="slideshow-wrapper">
                    <div class="slideshow-header-container" part="slideshow-header-container">
                        <slot name="slideshow-header"></slot>
                    </div>
                    <div class="slideshow-slide-container" part="slideshow-slide-container">
                        <slot></slot>
                    </div>
                    <div class="slideshow-footer-container" part="slideshow-footer-container">
                        <slot name="slideshow-footer"></slot>
                    </div>
                    <div class="progress-bar-container" part="progress-bar-container">
                        <progress max="100" value=""></progess>
                    </div>
                </div>`
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
        this.render();
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
        this._state.sStop = (this.getAttribute('stop')) ? this.getAttribute('stop') : "";
        this._state.sStart = (this.getAttribute('start')) ? this.getAttribute('start') : "";
        this._state.sPause = (this.getAttribute('pause')) ? this.getAttribute('pause') : "";
        this._state.nDuration = (this.getAttribute('duration') ? this.getAttribute('duration') : this.#oState.iDefaultTimer)
    }

    #getSlideTimer(iSlideIndex) {

        if (iSlideIndex == 0 || iSlideIndex) {

            let dSlide = this.#oState.adSlides[iSlideIndex];

            let iSlideTimer = null;

            iSlideTimer = dSlide.getAttribute('duration');


            if (iSlideTimer) {

                if (isNaN(iSlideTimer)) {

                    console.error(`CUI-SLIDESHOW - Slide ${iStartIndex} has invalid timer attribute value or is blank.`);

                }
                else {

                    return parseInt(iSlideTimer);
                }
            }

        }
        return this.#oState.iDefaultTimer;
    }

    #preSlideChange() {
        this.#recalculateSlideCount();
        let dActiveSlide = this.#oState.adSlides[this.#oState.iCurrentSlideIndex];

        this.#dispatchEvent('slide-change-coming', {
            dSlide: dActiveSlide,
            iSlideIndex: this.#oState.iCurrentSlideIndex
        });

        //event to be emitted before slide changes so data on future slide can be refreshed
        if (dActiveSlide) {
            this.addEventListener('refresh-slide', this.#refreshSlide.bind(this));
        }
    }

    // Method to start the slideshow
    #startShow(iStartIndex = 0) {

        this.#recalculateSlideCount();
        this.#oState.sPlayState = "playing"
        this.#changeSlide(iStartIndex, true, true);
    }

    #stopShow() {
        

        console.log("Show stopped");

        this.#oState.sPlayState = "stopped";

        // Clear out all
        clearInterval(this.vSlideChangePendingTimer);
        clearInterval(this.vSlideProgressTimer);
        clearInterval(this.vNextSlideProgressTimer);

        this.#resetProgress();
    }

    #pauseShow() {
        this.#oState.sPlayState = "paused";
        clearInterval(this.vNextSlideProgressTimer);
        clearInterval(this.vSlideProgressTimer);
        clearInterval(this.vSlideChangePendingTimer);

    }

    #resumeShow() {

        let iPendingTimer = (this.#oState.iCurrentSlideTimer / 2);

        if (this.#oState.iCurrentSlideElasped < iPendingTimer) {

            let iRemainingPendingTime = iPendingTimer - this.#oState.iCurrentSlideElasped;

            this.vSlideChangePendingTimer = setTimeout(() => {
                this.#preSlideChange();
            }, iRemainingPendingTime);
        }

        let iRemainingSlideTimer = this.#oState.iCurrentSlideTimer - this.iCurrentSlideElasped;

        if (iRemainingSlideTimer <= 0) {
            this.#changeSlide();

        } else {
            let iTargetTimer = this.#getSlideTimer(iTargetSlideIndex);
            this.sPlayState = "playing";

            this.vNextSlideProgressTimer = setInterval(() => {
                this.#changeSlide();
            }, iRemainingSlideTimer);

            this.vSlideProgressTimer = setInterval(() => {
                console.log("call update progress fxn");
                this.#updateProgress(100);
            }, iTargetTimer * .001)
        }

    }

    #showSlide(iSlideIndex = 0, bAutoCycle = true) {

        if (!this.#oState.adSlides || (this.#oState.adSlides.length === 0)) {

            this.#recalculateSlideCount();
        }

        if (this.#oState.adSlides && this.#oState.adSlides.length) {

            let dActiveSlide = this.#oState.adSlides[this.#oState.iCurrentSlideIndex];

            let dNextSlide = this.#oState.adSlides[iSlideIndex];

            if (dNextSlide) {

                // Update the active/previous slide index
                this.#oState.iPreviousSlideIndex = this.#oState.iCurrentSlideIndex;

                this.#oState.iCurrentSlideIndex = iSlideIndex;

                if (dActiveSlide && dActiveSlide.hasAttribute('active')) {
                    dActiveSlide.removeAttribute('active');
                }

                dNextSlide.setAttribute('active', '');

                this.#dispatchEvent('slide-changed', {
                    dSlide: dNextSlide,
                    iSlideIndex: this.#oState.iCurrentSlideIndex
                })

            }
            else {

                console.error(`CUI-SLIDESHOW - Unable show slide with invalid index of: ${iSlideIndex}`);
            }
        }
        else {

            console.error(`CUI-SLIDESHOW - No slides are known to exist `);

        }

    }

    #changeSlide(iTargetSlideIndex, bSetupNextSlide = true, bManualChange = false) {

        if (!isNaN(iTargetSlideIndex) || iTargetSlideIndex === 0) {

            if (iTargetSlideIndex > this.#oState.adSlides.length - 1) {
                iTargetSlideIndex = 0
            }

        } else {

            if (this.#oState.iCurrentSlideIndex !== null) {

                iTargetSlideIndex = this.#oState.iCurrentSlideIndex + 1;
                // console.log(iTargetSlideIndex, this.#oState.iCurrentSlideIndex, 'slide index')

                if (iTargetSlideIndex >= this.#oState.adSlides.length) {

                    iTargetSlideIndex = 0;
                    this.#oState.iCurrentSlideIndex = this.#oState.adSlides.length - 1;
                }

            } else {

                iTargetSlideIndex = 0
            }
        }

        let iTargetTimer = this.#getSlideTimer(iTargetSlideIndex);

        clearInterval(this.vSlideProgressTimer);
        clearInterval(this.vNextSlideProgressTimer);

        this.#resetProgress(iTargetTimer);

        this.#showSlide(iTargetSlideIndex);

        if (bSetupNextSlide) {

            this.#oState.sPlayState = "playing";

            this.#oState.iCurrentSlideTimer = iTargetTimer;

            this.vSlideChangePendingTimer = setTimeout(() => {
                this.#preSlideChange();
            }, iTargetTimer / 2);

            this.vNextSlideProgressTimer = setInterval(() => {
                this.#changeSlide();
            }, iTargetTimer);

            this.vSlideProgressTimer = setInterval(() => {
                this.#updateProgress();
            }, iTargetTimer * .001)

        }
        
        // Check to see if the slideshow is playing and its targetting 0 (i.e starting over)
        if ( this.#oState.sPlayState === "playing" && iTargetSlideIndex === 0 && !bManualChange) {
            
            // Dispatch this event here that way if the parent app calls stop or cancels the intervals can be cleared
            this.#dispatchEvent('cycle-restart')
        }
    }

    #recalculateSlideCount() {

        this.#oState.adSlides = this.querySelectorAll('cui-slide');


    }

    #resetProgress(iTimer) {

        this.dProgressBar.setAttribute('max', iTimer);
        this.dProgressBar.setAttribute('value', 0);
    }

    #updateProgress() {

        //duration of slide
        let iMaxValue = parseInt(this.dProgressBar.getAttribute('max'));


        //value starts at 0, increments based on iMaxValue *.001
        let iCurrentValue = this.dProgressBar.getAttribute('value');
        // let initialProgressValue = 0;
        let incrementValue = iMaxValue * .001;

        if (iCurrentValue.length) {
            iCurrentValue = parseInt(iCurrentValue)
        } else {
            iCurrentValue = 0
        }

        iCurrentValue += incrementValue;

        this._state.iCurrentSlideElasped = iCurrentValue

        if (this.#oState.sPlayState === "playing") {
            this.dProgressBar.setAttribute('value', iCurrentValue)
        }
    }

    #getNextSlide(dir) {

        if (dir) {

            let iNextSlide;

            if (!this.#oState.adSlides) {
                this.#recalculateSlideCount();
            }

            let iCurrentTotalSlides = this.#oState.adSlides.length;

            if (dir === "forward") {
                iNextSlide = this.#oState.iCurrentSlideIndex + 1;
                if (iNextSlide > iCurrentTotalSlides) {
                    iNextSlide = 0;
                }
            } else {
                iNextSlide = this.#oState.iCurrentSlideIndex - 1;
                if (iNextSlide < 0) {
                    iNextSlide = iCurrentTotalSlides;
                }
            }

            this.#changeSlide(iNextSlide, false);
        }
    }

    // event listeners
    // Private Events
    // ===========================

    // Private event method to catch the load of a new slide
    #slideLoad(evt) {

        evt.stopPropagation();

        // Reemit event with addtional context off the slideshow itself
        this.#dispatchEvent('slide-load', {
            sSlideEvent: "load",
            dSlide: evt.target,
            iSlideIndex: this.#oState.iCurrentSlideIndex
        })

    }

    // Private event method to catch the unload of a slide
    #slideUnload(evt) {

        evt.stopPropagation();

        // Reemit event with addtional context off the slideshow itself
        this.#dispatchEvent('slide-unload', {
            sSlideEvent: "unload",
            dSlide: evt.target,
            iSlideIndex: this.#oState.iPreviousSlideIndex
        });

    }
    //to emit before end of slide so next slide will have updated data
    #refreshSlide(evt) {
        evt.stopPropagation();

        this.#dispatchEvent('refresh-slide', {
            sSlideEvent: "refreshing-slide",
            iSlideIndex: this.#oState.iCurrentSlideIndex + 1
        });
    }

    #keyDown(evt) {

        switch (evt.code) {

            case "Space":

                if (this.#oState.sPlayState === "playing") {

                    this.#pauseShow();
                }
                else if (this.#oState.sPlayState === "paused") {

                    this.#resumeShow();
                }
                else if (this.#oState.sPlayState==="stopped"){
                    this.#pauseShow();
                }
                else {

                    if (this.#oState.iCurrentSlideIndex) {

                        this.#changeSlide(this.#oState.iCurrentSlideIndex);
                    }
                    else {

                        this.#changeSlide(0)
                    }

                }

                break;

            case "Home":

                this.#stopShow();
                this.#changeSlide(0, false);

                break;

            case "End":

                this.#stopShow();
                this.#changeSlide(this.#oState.adSlides.length - 1, false);

                break;

            case "ArrowLeft":
            case "ArrowUp":

                this.#stopShow();
                this.#oState.iCurrentSlideIndex - 1;
                this.#getNextSlide("back");
                console.log(this.#oState.iCurrentSlideIndex)

                break;

            case "ArrowRight":
            case "ArrowDown":

                this.#stopShow();
                this.#oState.iCurrentSlideIndex + 1;
                this.#getNextSlide("forward");
                console.log(this.#oState.iCurrentSlideIndex)
                break;

        }

    }

    #dispatchEvent(sEventName, oCustomDetails = {}) {

        if (sEventName) {

            let oEmitDetails = Object.assign({
                sEvent: sEventName,
                dSlideShow: this
            }, oCustomDetails);

            const O_CUSTOM_EVENT = new CustomEvent(sEventName, {
                detail: oEmitDetails,
                bubbles: true,
                cancelable: true
            });

            this.dispatchEvent(O_CUSTOM_EVENT);
        }
        else {

            console.error(`CUI-SLIDESHOW - Dispatch event called, but no event name was provided`);
        }

    }

    // Public Methods
    // ==========================================

    addNewSlides(oSlide = {}, sSlideContents, bAdvanceOnCreate = false) {

        let dNewSlide = document.createElement('cui-slide');

        if (typeof oSlide === "object" && sSlideContents && sSlideContents.length) {

            for (let sAttributes in oSlide) {

                dNewSlide.setAttribute(sAttributes, oSlide[sAttributes]);

            }

            dNewSlide.innerHTML = sSlideContents;

        }

        this.append(dNewSlide);

        this.#oState.adSlides = document.querySelectorAll('cui-slide');


        if (bAdvanceOnCreate) {

            this.#showSlide(this.#oState.adSlides.length - 1);
        }
    }

    removeSlides() {
        let generatedSlides = document.querySelectorAll('.generated-slide');
        for (let slide of generatedSlides) {
            slide.remove();
        }
    }

    // Method to dispatch an event warning that as slide is about to change (half way point)
    changeSlideEvt() {
        
        this.#dispatchEvent('slide-changed', {
            iSlideIndex: this.nSlideIndex
        });

    }

    previousSlideEvent() {

        this.#dispatchEvent('previous-slide', {
            iSlideIndex: this.nSlideIndex - 1,
            dSlide: this.#oState.adSlides[this.nSlideIndex - 1]
        });

    }

    currentSlideEvent() {
        this.#dispatchEvent('current-slide', {
            iSlideIndex: this.nSlideIndex,
            dSlide: this.#oState.adSlides[this.nSlideIndex]
        });
    }

    nextSlideEvent() {

        if ([this.nSlideIndex + 1] > this.#oState.adSlides.length) {
            this.toggleFirstSlide(this.nSlideIndex);
            this.nSlideIndex = 0;
            console.log('restart function')
        }

        this.#dispatchEvent('next-slide', {
            iSlideIndex: this.nSlideIndex + 1,
            dSlide: this.#oState.adSlides[this.nSlideIndex + 1]
        });

        if (this.nSlideIndex == this.#oState.adSlides.length - 1) {
            this.nSlideIndex = - 1;
        }
        this.dispatchEvent(nextSlide);

    }

    start(iTargetStartSlide) {

        this.#recalculateSlideCount();
        this.#startShow(iTargetStartSlide);
    }

    // not sure if we want this one
    manualStart(iStartIndex = 0){

        this.#recalculateSlideCount();
        this.#changeSlide(iStartIndex);
        this.#pauseShow();
    }

    stop() {

        this.#stopShow();
    }

    connectedCallback() {
        this.#oState.bAutomaticStart = (this.hasAttribute('manualstart')) ? false : true;

        // this._connected = true;
        // this.populateStateFromAttributes();
        // this.init();
        this.render();

    }

    render() {
        // First time initialization
        if (!this.#bRendered) {
            this.shadowRoot.innerHTML = `${this.style}${this.template}`;
            this.dProgressBar = this.shadowRoot.querySelector('progress');

            this.addEventListener('slide-load', this.#slideLoad.bind(this));
            this.addEventListener('slide-unload', this.#slideUnload.bind(this));
            document.body.addEventListener('keydown', this.#keyDown.bind(this));

            this.#bRendered = true;
        }

    }

}

export { SLIDE_SHOW }