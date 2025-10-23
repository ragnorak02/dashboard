import SLIDE_SHOW_STYLES from './slideShow.scss';
// import SLIDE from './components/slide/slide.js';
import TEST_OBJECT from './testObject.json';

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
        vNextSlideTimer: null,              // Current slide timer
        vSlideChangePendingTimer: null,     // Slide halfway mark timer
        vSlideProgressTimer: null           // Progress Timer update
    };

    constructor() {

        super();
        this._connected = false;
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
        this.aoTestObject = TEST_OBJECT;
        // this.oCurrentSlide = null;

        // this.#oState.adSlides = null;
        // // this.slideInterval = null;
        // this.slideIntervalNew = null;

        // this.iSlideIndex = 0;
        // this.nPreviousSlideIndex = null;
        // this.nNextSlideIndex = null;

        // this.intervalTimeout = null;
        // this.oActiveSlide = null;
        // this.dNextSlide = null
        this.slideLayout = "";

        // this.iTime = null;
        // this.iCurrentSlideDuration = null;

        // this.refreshTime = null;


        // this.iProgressValue = null;


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

        //return `<slot></slot>
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

    #showSlide(iSlideIndex = 0) {
        this.#oState.adSlides = document.querySelectorAll('cui-slide')

        if (!this.#oState.adSlides || (this.#oState.adSlides.length === 0)) {

            this.#recalculateSlideCount();
        }
        else {

            console.log("Slides exist");

            console.log(this.#oState.adSlides);

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

            }
            else {

                console.error(`CUI-SLIDESHOW - Unable show slide with invalid index of: ${iSlideIndex}`);
            }
        }
        else {

            console.error(`CUI-SLIDESHOW - No slide are known to exist`);
        }

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
        this._state.sStop = (this.getAttribute('stop')) ? this.getAttribute('stop') : "";
        this._state.sStart = (this.getAttribute('start')) ? this.getAttribute('start') : "";
        this._state.sPause = (this.getAttribute('pause')) ? this.getAttribute('pause') : "";
        this._state.nDuration = (this.getAttribute('duration') ? this.getAttribute('duration') : this.#oState.iDefaultTimer)
    }



    // initialDuration() {
    //     this.iProgressValue = 0;
    //     if (this.iCurrentSlideDuration == null) {
    //         try {
    //             this.iCurrentSlideDuration = parseInt(this.#oState.adSlides[this.nSlideIndex].getAttribute('duration'));

    //         } catch (error) {
    //             this.iCurrentSlideDuration = this.iDefaultTime
    //         }
    //         this.dProgressBar.setAttribute("max", this.iCurrentSlideDuration);
    //         this.dProgressBar.setAttribute('value', this.iProgressValue);
    //         return this.iCurrentSlideDuration
    //     }


    // }

    // getSlideTimer() {

    //     let dSlide = this.#oState.adSlides[this.nSlideIndex];
    //     let iSlideTimer = null;
    //     iSlideTimer = parseInt(dSlide.getAttribute('duration'));
    //     if (iSlideTimer) {
    //         if (isNaN(iSlideTimer)) {
    //             console.error(`CUI-SLIDESHOW - Slide ${dSlide} has invalid timer attribute value or is blank.`);
    //         } else {
    //             return parseInt(iSlideTimer);
    //         }
    //     }


    //     return this.iDefaultTime
    // }






    //initially creating slides dynamically from test object using data in init
    // createSlides(data) {
    //     if (data == null) {
    //         data = this.aoTestObject
    //     }

    //     for (let layout of data) {

    //         //creating cui-slide
    //         if (layout?.layout === undefined || layout?.layout === null) {
    //             console.log('no layout defined', layout);
    //             layout.layout = "";
    //         }
    //         if (layout?.duration === undefined || layout?.duration === null) {
    //             console.log('no duration defined', layout);
    //             layout.duration = this.iDefaultTime;
    //         }
    //         if (layout?.title === undefined || layout?.title === null) {
    //             console.log('no title defined', layout);
    //             layout.title = "";
    //         }
    //         if (layout?.chartLocationLeft === undefined || layout?.chartLocationLeft === null) {
    //             // console.log('no chart location defined');
    //             layout.chartLocationLeft = "";
    //         }
    //         if (layout?.chartLocationRight === undefined || layout?.chartLocationRight === null) {
    //             // console.log('no chart location defined');
    //             layout.chartLocationRight = "";
    //         }
    //         if (layout?.chartLocationTop === undefined || layout?.chartLocationTop === null) {
    //             // console.log('no chart location defined');
    //             layout.chartLocationTop = "";
    //         }
    //         if (layout?.chartLocationBottom === undefined || layout?.chartLocationBottom === null) {
    //             // console.log('no chart location defined');
    //             layout.chartLocationBottom = "";
    //         }

    //         let dCuiSlideShow = document.querySelector('cui-slide-show');
    //         let oSlide = document.createElement("cui-slide");
    //         oSlide.setAttribute('layout', layout.layout);
    //         oSlide.setAttribute('duration', layout.duration);
    //         oSlide.setAttribute('class', "generated-slide");
    //         oSlide.setAttribute('name', layout.name);
    //         oSlide.setAttribute('action', layout.action);
    //         oSlide.setAttribute('title', layout.title);
    //         oSlide.setAttribute('footer', layout.footer);

    //         dCuiSlideShow.appendChild(oSlide);

    //         //creating charts/graphs
    //         let leftChartInfo = layout.chartLocationLeft;

    //         if (leftChartInfo) {

    //             let lChart = document.createElement("cui-chart-bar");
    //             let lChartDiv = document.createElement('div');

    //             lChartDiv.setAttribute("slot", "top-left-column")
    //             lChart.setAttribute("chartTitle", leftChartInfo.chartTitle);
    //             lChart.setAttribute('type', leftChartInfo.type);
    //             lChart.setAttribute('id', leftChartInfo.id);
    //             lChart.setAttribute('location', leftChartInfo.location);

    //             //temp chart ID
    //             // lChart.setAttribute('id', "#example-left");

    //             lChartDiv.append(lChart);
    //             oSlide.appendChild(lChartDiv);
    //             lChart.setState({
    //                 data:this.oParcelInfo
    //             });
    //         }

    //         let sRightChartInfo = layout.chartLocationRight;

    //         if (sRightChartInfo) {

    //             let rChart = document.createElement("cui-chart");
    //             let rChartDiv = document.createElement('div');

    //             rChartDiv.setAttribute("slot", "top-right-column");
    //             rChart.setAttribute("chartTitle", sRightChartInfo.chartTitle);
    //             rChart.setAttribute('type', sRightChartInfo.type);
    //             rChart.setAttribute('id', sRightChartInfo.id);
    //             rChart.setAttribute('location', sRightChartInfo.location);

    //             //temp chart ID
    //             // rChart.setAttribute('id', "#example-right");

    //             rChartDiv.append(rChart);
    //             oSlide.appendChild(rChartDiv);

    //             rChart.setState({
    //                 data:this.aoServices
    //             });
    //         };


    //         let topChartInfo = layout.chartLocationTop;

    //         if (topChartInfo) {

    //             let topRowChart = document.createElement("cui-chart");
    //             let topRowChartDiv = document.createElement("div");

    //             topRowChartDiv.setAttribute("slot", "top-row");
    //             topRowChart.setAttribute("chartTitle", topChartInfo.chartTitle);
    //             topRowChart.setAttribute('type', topChartInfo.type);
    //             topRowChart.setAttribute('id', topChartInfo.id);
    //             topRowChart.setAttribute('location', topChartInfo.location);
    //             topRowChart.setAttribute('xAxisTickCount', topChartInfo.xAxisTickCount);

    //             //temp chart ID
    //             // topRowChart.setAttribute('id', "#example-top-row");

    //             topRowChartDiv.append(topRowChart);
    //             oSlide.appendChild(topRowChartDiv);

    //             topRowChart.setState({
    //                 data:this.aoServicesHigh
    //             });

    //         };

    //         let bottomChartInfo = layout.chartLocationBottom

    //         if (bottomChartInfo) {
    //             let bottomRowChart = document.createElement("cui-chart");
    //             let bottomRowChartDiv = document.createElement('div');

    //             bottomRowChartDiv.setAttribute("slot", "bottom-row")
    //             bottomRowChart.setAttribute("chartTitle", bottomChartInfo.chartTitle);
    //             bottomRowChart.setAttribute('type', bottomChartInfo.type);
    //             bottomRowChart.setAttribute('id', bottomChartInfo.id);
    //             bottomRowChart.setAttribute('location', bottomChartInfo.location);
    //             bottomRowChart.setAttribute('yAxisGrid', bottomChartInfo.yAxisGrid);

    //             //temp chart ID, create function to create unique id
    //             // bottomRowChart.setAttribute('id', "#example-bottom-row");

    //             bottomRowChartDiv.append(bottomRowChart)
    //             oSlide.appendChild(bottomRowChartDiv);

    //             bottomRowChart.setState({
    //                 data:this.aoParcelAllExemptions
    //             });

    //         };

    //         //creating counters
    //         let topCountInfo = layout.countLocationTop
    //         if (topCountInfo) {
    //             let topRowCount = document.createElement(('cui-counter'));
    //             let topRowCountDiv = document.createElement('div');
    //             topRowCountDiv.setAttribute('slot', 'top-row');
    //             topRowCount.setAttribute('title', topCountInfo.countTitle);
    //             topRowCount.setAttribute('sub-title', topCountInfo.countSubTitle);
    //             topRowCount.setAttribute('count', topCountInfo.count);

    //             topRowCountDiv.append(topRowCount);
    //             oSlide.appendChild(topRowCountDiv);
    //         }

    //         let bottomCountInfo = layout.countLocationBottom;
    //         if (bottomCountInfo) {
    //             let bottomRowCount = document.createElement(('cui-counter'));
    //             let bottomRowCountDiv = document.createElement('div');
    //             bottomRowCountDiv.setAttribute('slot', 'bottom-row');
    //             bottomRowCount.setAttribute('title', bottomCountInfo.countTitle);
    //             bottomRowCount.setAttribute('sub-title', bottomCountInfo.countSubTitle);
    //             bottomRowCount.setAttribute('count', bottomCountInfo.count);

    //             bottomRowCountDiv.append(bottomRowCount);
    //             oSlide.appendChild(bottomRowCountDiv);



    //         }



    //     }

    // }


    // createId(data) {
    //     if (data == null) {
    //         data = this.aoTestObject
    //     }

    //     for (let layout of data) {

    //         this.sId = "";
    //     }


    // }



    removeSlides() {
        let generatedSlides = document.querySelectorAll('.generated-slide');
        for (let slide of generatedSlides) {
            slide.remove();
        }
    }



    #getSlideTimer(iSlideIndex) {

        // this.#oState.adSlides = document.querySelectorAll('cui-slide');
        if (iSlideIndex) {

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
            return this.#oState.iDefaultTimer;
        }
    }

    #preSlideChange() {
        let dActiveSlide = this.#oState.adSlides[this.#oState.iCurrentSlideIndex];

        this.#dispatchEvent('slide-change-coming', {
            dSlide: dActiveSlide,
            iSlideIndex: this.#oState.iCurrentSlideIndex
        });
    }

    // Method to start the slideshow
    #startShow(iStartIndex = 0) {

        this.#recalculateSlideCount();
        this.#oState.sPlayState = "playing"
        this.#changeSlide(iStartIndex);

    }
    #stopShow() {
        this.#oState.sPlayState = "stopped";
        console.log('stop');
        this.#resetProgress();

    }
    #pauseShow() {
        this.#oState.sPlayState = "paused";
        clearInterval(this.vNextSlideTimer);
        clearInterval(this.vSlideProgressTimer);
        clearInterval(this.vSlideChangePendingTimer);
        console.log('pause');
        // this.resetProgress()
    }
    #resumeShow() {
        console.log('resume')
        let iPendingTimer = (this.#oState.iCurrentSlideTimer / 2);

        if (this.iCurrentSlideElasped < iPendingTimer) {
            let iRemainingPendingTime = iPendingTimer - this.iCurrentSlideElasped;

            this.vSlideChangePendingTimer = setTimeout(() => {
                this.#preSlideChange();
            }, iRemainingPendingTime);
        }
        let iRemainingSlideTimer = this.#oState.iCurrentSlideTimer - this.iCurrentSlideElasped;
        if (iRemainingSlideTimer <= 0) {
            this.#changeSlide()
        } else {
            this.sPlayState = "playing";

            this.vNextSlideTimer = setInterval(() => {
                this.#changeSlide();
            }, iRemainingSlideTimer);

            this.vSlideProgressTimer = setInterval(() => {
                console.log("call update progress fxn");
                this.#updateProgress(100);
            }, 100)
        }

    }




    #changeSlide(iTargetSlideIndex, bSetupNext = true) {

        if (!isNaN(iTargetSlideIndex) || iTargetSlideIndex === 0) {

            if (iTargetSlideIndex > this.#oState.adSlides.length - 1) {
                iTargetSlideIndex = 0
            }

        } else {

            if (this.#oState.iCurrentSlideIndex !== null) {

                iTargetSlideIndex = this.#oState.iCurrentSlideIndex + 1;

                if (iTargetSlideIndex >= this.#oState.adSlides.length) {

                    console.log("reset slide index, at end of show");

                    iTargetSlideIndex = 0;
                }
            } else {
                iTargetSlideIndex = 0
                console.log(this.#oState.adSlides)
            }
        }

        let iTargetTimer = this.#getSlideTimer(iTargetSlideIndex);

        clearInterval(this.vSlideProgressTimer);
        clearInterval(this.vNextSlideTimer);
        this.#resetProgress(iTargetTimer);

        this.#showSlide(iTargetSlideIndex);

        if (bSetupNext) {

            this.#oState.sPlayState = "playing";

            this.vSlideChangePendingTimer = setTimeout(() => {
                this.#preSlideChange();
            }, iTargetTimer / 2);

            this.#oState.iCurrentSlideTimer = iTargetTimer;

            this.vNextSlideTimer = setInterval(() => {
                this.#changeSlide();
            }, iTargetTimer);


            this.vSlideProgressTimer = setInterval(() => {
                this.#updateProgress();
            }, iTargetTimer * .001)
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
            let iNextSlide = null;
            let iCurrentTotalSlides = this.#oState.adSlides.length - 1;

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

    // restartInterval() {
    //     this.nSlideIndex++;
    //     clearInterval(this.slideInterval);
    //     if (this.nSlideIndex == this.#oState.adSlides.length) {
    //         this.nSlideIndex = 0
    //     }

    //     this.showSlideInterval();

    // }

    //refresh Data within chart fxn
    refreshData() {

        this.refreshTime = 58000;

        try {
            let refresh = setInterval(() => {
                let aoSlides = document.querySelectorAll('cui-slide');
                let slideShow = document.querySelector('cui-slide-show');
                //removes all slides from slide show
                // slideShow.innerHTML = "";

                //removes slides that were created by this.aoTestObject
                this.removeSlides();
                console.log('generated slides were removed');

                //creates new slides from data only
                this.createSlides();
                console.log('new slides created from data');

            }, this.refreshTime);
        } catch (error) {
            console.error('slides were not refreshed');

        }
    }

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

            // this.showSlide(this.#oState.adSlides.length - 1);
            this.#showSlide(this.#oState.adSlides.length - 1);
        }
    }

    // removeCurrentActiveSlide() {
    //     this.oCurrentSlide = document.getAttribute('.active');
    //     this.oCurrentSlide.setAttribute('style', 'opacity:0;');
    //     this.oCurrentSlide.removeAttribute('class', 'active');
    // }


    // resetValues() {
    //     this.iTime = null;
    // }


    //event listeners
    // Private Events
    // ===========================

    // Private event method to catch the load of a new slide
    #slideLoad(evt) {

        evt.stopPropagation();

        // Reemit event with addtional context off the slideshow itself
        this.#dispatchEvent('slide-change', {
            sSlideEvent: "load",
            dSlide: evt.target,
            iSlideIndex: this.#oState.iCurrentSlideIndex
        })

    }

    // Private event method to catch the unload of a slide
    #slideUnload(evt) {

        evt.stopPropagation();

        // Reemit event with addtional context off the slideshow itself
        this.#dispatchEvent('slide-change', {
            sSlideEvent: "unload",
            dSlide: evt.target,
            iSlideIndex: this.#oState.iPreviousSlideIndex
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
                this.#getNextSlide("back");
                break;

            case "ArrowRight":
            case "ArrowDown":

                this.#stopShow();
                this.#getNextSlide("forward");
                break;

        }

    }

    // addEventListeners() {
    //     this.addEventListener('slideChange', e => {
    //         if (this.slideInterval++) {
    //             const changeEvent = new CustomEvent('slideChanged', {
    //                 detail: {
    //                     slideIndex: this.nSlideIndex,
    //                     bubbles: true,
    //                     detail: 'slide has changed'
    //                 }
    //             });
    //             this.dispatchEvent(changeEvent);
    //         }
    //     }, false);

    //     this.addEventListener('previousSlide', e => {
    //         if (this.slideInterval--) {
    //             const previousSlideEvent = new CustomEvent('previousSlide', {
    //                 detail: {
    //                     slideIndex: this.nSlideIndex,
    //                     bubbles: true,
    //                     detail: 'previous slide'
    //                 }
    //             });
    //             this.dispatchEvent(previousSlideEvent);
    //         }
    //     }, false);
    // }


    uploadCompleteEvent() {

        this.#dispatchEvent('uploading-complete', {
            detail: { message: "Created slides upload complete" },
        });

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

    //event should let you know if next slide has action to refresh slide
    refreshSlideEvent() {

        let refreshingSlide;

        if (this.nSlideIndex + 1 == this.#oState.adSlides.length) {
            refreshingSlide = this.#oState.adSlides[0].getAttribute('action');
        }

        // if (refreshingSlide === undefined || refreshingSlide === null) {
        //     // console.log('do no refreshing')
        // }
        if (this.nSlideIndex < [this.#oState.adSlides.length - 1]) {
            if (this.#oState.adSlides[this.nSlideIndex + 1].getAttribute('action') === "refresh") {

                let refreshSlide = new CustomEvent("refresh-slide", {
                    detail: { message: "need to re-request info for next slide if timer is up" },
                    bubbles: true,
                    cancelable: true
                })
                this.dispatchEvent(refreshSlide);
            }
        } else if ([this.nSlideIndex + 1] == this.#oState.adSlides.length) {
            if (this.#oState.adSlides[0].getAttribute('action') === "refresh") {
                let refreshSlide = new CustomEvent("refresh-slide", {
                    detail: { message: "need to re-request info for next slide if timer is up" },
                    bubbles: true,
                    cancelable: true
                })
                this.dispatchEvent(refreshSlide);
            }
        }
    }

    // intervalEvent() {
    //     let intervalEvent = new Event('interval');
    // }


    start(iTargetStartSlide) {

        console.log("Start slide show");
        this.#recalculateSlideCount();
        this.#startShow(iTargetStartSlide);
    }

    connectedCallback() {
        this.#oState.bAutomaticStart = (this.hasAttribute('manualstart')) ? false : true;
        this._connected = true;
        // this.populateStateFromAttributes();
        // this.init();
        this.render();


    }

    render() {
        // First time initialization
        if (!this.#bRendered) {
            this.shadowRoot.innerHTML = `${this.style}${this.template}`;
            this.addEventListener('slide-load', this.#slideLoad.bind(this));
            this.addEventListener('slide-unload', this.#slideUnload.bind(this));
            document.body.addEventListener('keydown', this.#keyDown.bind(this));
        }

        this.#oState.adSlides = this.querySelectorAll('cui-slide');
        this.dProgressBar = this.shadowRoot.querySelector('progress');


        // this.#oState.adSlides = document.querySelectorAll('cui-slide');


        // for (let slide of this.#oState.adSlides) {
        //     slide.getAttribute('duration') === null ? slide.setAttribute('duration', this.#oState.iDefaultTimer) : true;
        //     slide.getAttribute('layout') === null ? slide.setAttribute('layout', "") : true;
        //     slide.getAttribute('title') === null ? slide.setAttribute('title', "") : true;
        //     slide.getAttribute('footer') === null ? slide.setAttribute('footer', "") : true;

        // }



        //first slide not showing as screen is loading
        this.uploadCompleteEvent();

        if (!this.#bRendered) {

            if (this.#oState.bAutomaticStart) {

                this.#startShow();
            }

            this.#bRendered = true;
        }

    }

}

export { SLIDE_SHOW }