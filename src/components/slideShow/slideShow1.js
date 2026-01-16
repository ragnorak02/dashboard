import SLIDE_SHOW_STYLES from './slideShow.scss';
// import SLIDE from './components/slide/slide.js';
import TEST_OBJECT from './testObject.json';

export default class SLIDE_SHOW extends HTMLElement {

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
            sPause: null
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
        this.oCurrentSlide = null;
        this.refreshTime = null;
        this.aoSlides = null;
        this.slideInterval = null;
        this.slideIntervalNew = null;
        this.nCurrentSlideDuration = null;
        this.nDefaultTime = 10000;
        this.nSlideIndex = 0;
        this.intervalTimeout = null;
        this.oActiveSlide = null;
        this.nTime = null;
        this.slideLayout = "";


    }

    get style() {
        return `<style>${SLIDE_SHOW_STYLES}</style>`;
    }

    get template() {
        return `<slot></slot>`;
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
  init(){
    this.oParcelInfo = [
        {
            "topic": "Agriculteral",
            "value": 1,
            "color": "db0000"
        },
        {
            "topic": "Residential",
            "value": 20957,
            "color": "744f2b"
        },
        {
            "topic": "Vacant",
            "value": 4120,
            "color": "6f5091"
        },
        {
            "topic": "Commercial",
            "value": 3609,
            "color": "abad23"
        },
        {
            "topic": "Recreation and Entertainment",
            "value": 83,
            "color": "507f70"
        },
        {
            "topic": "Community Service",
            "value": 546,
            "color": "dc6b2f"
        },
        {
            "topic": "Industrial",
            "value": 20,
            "color": "7a99ac"
        },
        {
            "topic": "Public Service",
            "value": 175,
            "color": "009cde"
        },
        {
            "topic": "Public Parks, Wild, \nForested and Conservation",
            "value": 84,
            "color": "d126ac"
        }
    ];

    this.aoParcelAllExemptions = [
        {
            "short": "A",
            "topic": "Wholly Exempt, Public Owned",
            "value": 10.84
        },
        {
            "short": "B",
            "topic": "Wholly Exempt, Privately Owned",
            "value": 10.39
        },
        // {
        //     "topic": "Partially Exempt, Public Owned",
        //     "value": 0
        // },
        {
            "short": "C",
            "topic": "Partially Exempt, Privately Owned",
            "value": 78.13
        },
        {
            "short": "D",
            "topic": "Invalidly Coded Exemptions",
            "value": 0.64
        },
    ];

    this.dtfPie = [
        {
            "value": 7076,
            "topic": "dtf-dev-nimbus-fwrk"
        },
        {
            "value": 1,
            "topic": "dtf-dev-nimbus-rpsacp"
        },
        {
            "value": 159,
            "topic": "dtf-dev-nimbus-amp"
        },
        {
            "value": 774,
            "topic": "dtf-dev-nimbus-common"
        },
        {
            "value": 69,
            "topic": "dtf-dev-nimbus-corresp"
        },
        {
            "value": 62,
            "topic": "dtf-dev-nimbus-cris"
        }
    ]

    this.aoServices = [
        {
            "topic": "United States",
            "value": 12394,
        },
        {
            "topic": "Russia",
            "value": 6148,
        },
        {
            "topic": "Germany (FRG)",
            "value": 1653,
        },
        {
            "topic": "France",
            "value": 2162,
        },
        {
            "topic": "United Kingdom",
            "value": 1214,
        },
        {
            "topic": "China",
            "value": 1131,
        },
        {
            "topic": "Spain",
            "value": 814,
        },
        {
            "topic": "Netherlands",
            "value": 1167,
        },
        {
            "topic": "Italy",
            "value": 660,
        },
        {
            "topic": "Israel",
            "value": 1263,
        }
    ];
        this.aoServicesHigh = [
            {
                "topic": "United States",
                "value": 1239400,
            },
            {
                "topic": "Russia",
                "value": 614800,
            },
            {
                "topic": "Germany (FRG)",
                "value": 165300,
            },
            {
                "topic": "France",
                "value": 216200,
            },
            {
                "topic": "United Kingdom",
                "value": 121400,
            },
            {
                "topic": "China",
                "value": 113100,
            },
            {
                "topic": "Spain",
                "value": 81400,
            },
            {
                "topic": "Netherlands",
                "value": 116700,
            },
            {
                "topic": "Italy",
                "value": 66000,
            },
            {
                "topic": "Israel",
                "value": 126300,
            }
        ]; 
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
        this._state.nDuration = (this.getAttribute('duration') ? this.getAttribute('duration') : this.nDefaultTime)
    }
    connectedCallback() {
        this._connected = true;
        // this.populateStateFromAttributes();
        this.init();
        this.render();
        
    }

    render() {

        this.shadowRoot.innerHTML = `${this.style}${this.template}`;
        this.createSlides();

        this.addEventListeners();

        this.aoSlides = document.querySelectorAll('cui-slide');


        for (let slide of this.aoSlides) {
            slide.getAttribute('duration') === null ? slide.setAttribute('duration', this.nDefaultTime) : true;
            slide.getAttribute('layout') === null ? slide.setAttribute('layout', "") : true;
            slide.getAttribute('title') === null ? slide.setAttribute('title', "") : true;
            slide.getAttribute('footer') === null ? slide.setAttribute('footer', "") : true;

        }

        let timer = document.querySelector('slide-show-timer');

        //first slide not showing as screen is loading
        this.uploadCompleteEvent();
        timer.setAttribute('style', 'display:none;');

    }

    //initially creating slides dynamically from test object
    createSlides(data) {
        if (data == null) {
            data = this.aoTestObject
        }

        for (let layout of data) {

            //creating cui-slide
            if (layout?.layout === undefined || layout?.layout === null) {
                console.log('no layout defined', layout);
                layout.layout = "";
            }
            if (layout?.duration === undefined || layout?.duration === null) {
                console.log('no duration defined', layout);
                layout.duration = this.nDefaultTime;
            }
            if (layout?.title === undefined || layout?.title === null) {
                console.log('no title defined', layout);
                layout.title = "";
            }
            if (layout?.chartLocationLeft === undefined || layout?.chartLocationLeft === null) {
                // console.log('no chart location defined');
                layout.chartLocationLeft = "";
            }
            if (layout?.chartLocationRight === undefined || layout?.chartLocationRight === null) {
                // console.log('no chart location defined');
                layout.chartLocationRight = "";
            }
            if (layout?.chartLocationTop === undefined || layout?.chartLocationTop === null) {
                // console.log('no chart location defined');
                layout.chartLocationTop = "";
            }
            if (layout?.chartLocationBottom === undefined || layout?.chartLocationBottom === null) {
                // console.log('no chart location defined');
                layout.chartLocationBottom = "";
            }

            let dCuiSlideShow = document.querySelector('cui-slide-show');
            let oSlide = document.createElement("cui-slide");
            oSlide.setAttribute('layout', layout.layout);
            oSlide.setAttribute('duration', layout.duration);
            oSlide.setAttribute('class', "generated-slide");
            oSlide.setAttribute('name', layout.name);
            oSlide.setAttribute('action', layout.action);
            oSlide.setAttribute('title', layout.title);
            oSlide.setAttribute('footer', layout.footer);

            dCuiSlideShow.appendChild(oSlide);

            //creating charts/graphs
            let leftChartInfo = layout.chartLocationLeft;

            if (leftChartInfo) {

                let lChart = document.createElement("cui-chart-bar");
                let lChartDiv = document.createElement('div');

                lChartDiv.setAttribute("slot", "top-left-column")
                lChart.setAttribute("chartTitle", leftChartInfo.chartTitle);
                lChart.setAttribute('type', leftChartInfo.type);
                lChart.setAttribute('id', leftChartInfo.id);
                lChart.setAttribute('location', leftChartInfo.location);

                //temp chart ID
                // lChart.setAttribute('id', "#example-left");

                lChartDiv.append(lChart);
                oSlide.appendChild(lChartDiv);
                lChart.setState({
                    data:this.oParcelInfo
                });
            }

            let sRightChartInfo = layout.chartLocationRight;

            if (sRightChartInfo) {

                let rChart = document.createElement("cui-chart");
                let rChartDiv = document.createElement('div');

                rChartDiv.setAttribute("slot", "top-right-column");
                rChart.setAttribute("chartTitle", sRightChartInfo.chartTitle);
                rChart.setAttribute('type', sRightChartInfo.type);
                rChart.setAttribute('id', sRightChartInfo.id);
                rChart.setAttribute('location', sRightChartInfo.location);

                //temp chart ID
                // rChart.setAttribute('id', "#example-right");

                rChartDiv.append(rChart);
                oSlide.appendChild(rChartDiv);

                rChart.setState({
                    data:this.aoServices
                });
            };


            let topChartInfo = layout.chartLocationTop;

            if (topChartInfo) {

                let topRowChart = document.createElement("cui-chart");
                let topRowChartDiv = document.createElement("div");

                topRowChartDiv.setAttribute("slot", "top-row");
                topRowChart.setAttribute("chartTitle", topChartInfo.chartTitle);
                topRowChart.setAttribute('type', topChartInfo.type);
                topRowChart.setAttribute('id', topChartInfo.id);
                topRowChart.setAttribute('location', topChartInfo.location);
                topRowChart.setAttribute('xAxisTickCount', topChartInfo.xAxisTickCount);

                //temp chart ID
                // topRowChart.setAttribute('id', "#example-top-row");

                topRowChartDiv.append(topRowChart);
                oSlide.appendChild(topRowChartDiv);

                topRowChart.setState({
                    data:this.aoServicesHigh
                });

            };

            let bottomChartInfo = layout.chartLocationBottom

            if (bottomChartInfo) {
                let bottomRowChart = document.createElement("cui-chart");
                let bottomRowChartDiv = document.createElement('div');

                bottomRowChartDiv.setAttribute("slot", "bottom-row")
                bottomRowChart.setAttribute("chartTitle", bottomChartInfo.chartTitle);
                bottomRowChart.setAttribute('type', bottomChartInfo.type);
                bottomRowChart.setAttribute('id', bottomChartInfo.id);
                bottomRowChart.setAttribute('location', bottomChartInfo.location);
                bottomRowChart.setAttribute('yAxisGrid', bottomChartInfo.yAxisGrid);

                //temp chart ID, create function to create unique id
                // bottomRowChart.setAttribute('id', "#example-bottom-row");

                bottomRowChartDiv.append(bottomRowChart)
                oSlide.appendChild(bottomRowChartDiv);

                bottomRowChart.setState({
                    data:this.aoParcelAllExemptions
                });

            };

            //creating counters
            let topCountInfo = layout.countLocationTop
            if (topCountInfo) {
                let topRowCount = document.createElement(('cui-counter'));
                let topRowCountDiv = document.createElement('div');
                topRowCountDiv.setAttribute('slot', 'top-row');
                topRowCount.setAttribute('title', topCountInfo.countTitle);
                topRowCount.setAttribute('sub-title', topCountInfo.countSubTitle);
                topRowCount.setAttribute('count', topCountInfo.count);

                topRowCountDiv.append(topRowCount);
                oSlide.appendChild(topRowCountDiv);
            }

            let bottomCountInfo = layout.countLocationBottom;
            if (bottomCountInfo) {
                let bottomRowCount = document.createElement(('cui-counter'));
                let bottomRowCountDiv = document.createElement('div');
                bottomRowCountDiv.setAttribute('slot', 'bottom-row');
                bottomRowCount.setAttribute('title', bottomCountInfo.countTitle);
                bottomRowCount.setAttribute('sub-title', bottomCountInfo.countSubTitle);
                bottomRowCount.setAttribute('count', bottomCountInfo.count);

                bottomRowCountDiv.append(bottomRowCount);
                oSlide.appendChild(bottomRowCountDiv);

                
                
            }

            

        }

    }


    createId(data) {
        if (data == null) {
            data = this.aoTestObject
        }

        for (let layout of data) {

            this.sId = "";
        }


    }


    removeSlides() {
        let generatedSlides = document.querySelectorAll('.generated-slide');
        for (let slide of generatedSlides) {
            slide.remove();
        }
    }

    recalculateSlideCount() {
        //initial total number of slides
        let nPriorTotalSlides = this.aoSlides.length;

        //current number of slides after reselecting
        this.aoSlides = document.querySelectorAll('cui-slide');

        let oCurrentSlide = document.querySelector('.active');

        console.log(this.aoSlides.length, 'should be different number before slides are added/removed');
        clearInterval(this.slideInterval);
        if (oCurrentSlide == this.aoSlides[this.nSlideIndex]) {
            console.log('new slide was added or removed after the current slide');

        } else if (oCurrentSlide !== this.aoSlides[this.nSlideIndex]) {

            console.log('new slide was added/removed before curent slide');
            oCurrentSlide.removeAttribute('class', 'active');
            oCurrentSlide.setAttribute('style', 'opacity:0');
            try {
                this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');
                this.aoSlides[this.nSlideIndex].setAttribute('style', 'opacity:1');
            } catch (error) {
                console.log('end of slide show, starting over');
                this.toggleFirstSlide();

            }



        }
        this.showSlideInterval();

        //gives slideIndex of previous active slide at time
        let oActiveSlide = document.querySelector('.active');
        let oSlide = (element) => element = oActiveSlide;

        let aoSlidesArray = Object.entries(this.aoSlides).map(([key, value]) => ({ [key]: value }));

        //index when info is refreshed
        let nSlideIndexBeforeRefresh = aoSlidesArray.findIndex(oSlide);
        console.log(nSlideIndexBeforeRefresh, 'the mystery');

        if (this.nSlideIndex !== nSlideIndexBeforeRefresh) {

        }

    }

    showSlideIntervalKeyListeners() {
        document.addEventListener('keydown', evt => {
            // this.resetValues();
            let keyCount = 0;
            if (evt.key == "ArrowLeft") {
                //previous slide

                clearTimeout(this.intervalTimeout);
                clearInterval(this.slideInterval);
                clearInterval(this.slideIntervalReset);


                if (this.nSlideIndex == 0) {
                    this.toggleLastSlide();
                    this.nSlideIndex = this.aoSlides.length - 1;

                    keyCount = 0;

                    return keyCount, this.nSlideIndex
                }

                else {

                    this.nSlideIndex = this.nSlideIndex - 1;
                    this.togglePreviousSlide(this.nSlideIndex);
                }

                this.nTime = null;
                isPaused = true;
                return this.nSlideIndex;

            } else if (evt.key == "ArrowRight") {
                //next slide

                clearTimeout(this.intervalTimeout);
                clearInterval(this.slideInterval);
                clearInterval(this.slideIntervalReset);

                if (this.nSlideIndex == this.aoSlides.length) {
                    this.toggleFirstSlide();
                    this.nSlideIndex = 0;
                    return this.nSlideIndex;
                } else {

                    this.toggleNextSlide();

                }
                this.nTime = null;
                isPaused = true;
                return this.nSlideIndex;

            } else if (evt.key == "End") {
                //last slide

                clearTimeout(this.intervalTimeout);
                clearInterval(this.slideInterval);
                clearInterval(this.slideIntervalReset);
                this.toggleLastSlide();
                this.nSlideIndex = this.aoSlides.length - 1;
                this.nTime = null;
                isPaused = true;
                console.log(this.nSlideIndex);
                return this.nSlideIndex;
            } else if (evt.key == "Home") {
                //first slide

                clearTimeout(this.intervalTimeout);
                clearInterval(this.slideInterval);
                clearInterval(this.slideIntervalReset);
                this.toggleFirstSlide();
                this.nSlideIndex = 0;
                this.nTime = null;
                isPaused = true;
                console.log(this.nSlideIndex);

            }
            else if (evt.key == " ") {
                //play/pause

                if (isPaused == false) {
                    clearTimeout(this.intervalTimeout);
                    clearInterval(this.slideInterval);
                    clearInterval(this.slideIntervalReset);
                    this.nTime = null;
                    isPaused = true;
                } else {
                    clearTimeout(this.intervalTimeout);
                    clearInterval(this.slideInterval);
                    clearInterval(this.slideIntervalReset);

                    this.showSlideInterval();
                    console.log(this.nSlideIndex);
                    isPaused = false;

                }
            }
            return this.nSlideIndex;
        });

        let isPaused = false;
    }
    showSlideInterval() {

        for (let oSlide of this.aoSlides) {
            oSlide.setAttribute('style', 'opacity:0;');
            oSlide.removeAttribute('class', 'active');
        }

        this.showActiveSlide(this.nSlideIndex);

        if (this.nSlideIndex == this.aoSlides.length) {
            this.nSlideIndex = 0;
            return this.nSlideIndex;
        }

        try {
            this.nTime = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
        } catch (error) {
            this.nTime = this.nDefaultTime
        }


        this.slideInterval = setInterval(() => {

            this.findSlideIndex();

            try {
                this.nTime = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
            } catch (error) {
                this.nTime = this.nDefaultTime
            }

            this.nSlideIndex++;

            if (this.nSlideIndex + 1 == this.aoSlides.length) {
                this.nSlideIndex = 0;
            }
            for (let oSlide of this.aoSlides) {

                oSlide.setAttribute('style', 'opacity:0;');
                oSlide.removeAttribute('class', 'active');

            }

            this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');
            this.aoSlides[this.nSlideIndex].setAttribute('style', 'opacity:1;');

            let intervalEvent = new Event('interval');
            document.dispatchEvent(intervalEvent);

            //events
            this.changeSlide(slideIndex);
            this.previousSlideEvent(slideIndex);
            this.currentSlideEvent(slideIndex);
            this.nextSlideEvent(slideIndex);

            try {
                this.nextSlideEvent(this.nSlideIndex);
                this.showActiveSlide(this.nSlideIndex);

            } catch (error) {
                this.nSlideIndex = 0;
                this.toggleFirstSlide(this.nSlideIndex);
            }

            this.refreshSlideEvent(this.nSlideIndex);

            this.nCurrentSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));

            this.nTime = null;
            this.nTime = Number(this.aoSlides[slideIndex].getAttribute('duration'))


            return this.nSlideIndex

        }, this.nTime);


        this.intervalTimeout = setTimeout(() => {

            this.restartInterval();
        }, this.nTime - 1)

    }

    start() {

        console.log("Start");


    }

    

    restartInterval() {
        this.nSlideIndex++;
        clearInterval(this.slideInterval);
        if (this.nSlideIndex == this.aoSlides.length) {
            this.nSlideIndex = 0
        }

        this.showSlideInterval();

    }


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
                console.log('new slides created from data')

            }, this.refreshTime);
        } catch (error) {
            console.error('slides were not refreshed');

        }
    }

    removeCurrentActiveSlide() {
        this.oCurrentSlide = document.getAttribute('.active');
        this.oCurrentSlide.setAttribute('style', 'opacity:0;');
        this.oCurrentSlide.removeAttribute('class', 'active');
    }

    showActiveSlide() {

        this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');
        this.aoSlides[this.nSlideIndex].setAttribute('style', 'opacity:1;');
        let timer = document.querySelector('slide-show-timer');
        timer.setAttribute('style', 'display:block;');


    }
    activeSlide() {
        let oActiveSlide = document.querySelector('.active');
        if (oActiveSlide == null) {
            return ""
        } else {
            return oActiveSlide
        }

    }

    findSlideIndex() {
        for (let i = 0; i < this.aoSlides.length; i++) {
            if (this.aoSlides[i].classList.contains('active')) {
                console.log(i, 'active slide index')
            }
        }
    }

    resetValues() {
        this.nTime = null;
    }

    //fxns used with keyboard events
    togglePreviousSlide() {
        let oCurrentSlide = document.querySelector('.active');
        for (let slide of this.aoSlides) {
            slide.setAttribute('style', 'opacity:0;');
        }
        oCurrentSlide.removeAttribute('class', 'active');

        this.aoSlides[this.nSlideIndex].setAttribute('style', 'opacity:1;');
        this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');

        return this.nSlideIndex

    }

    toggleNextSlide() {
        try {

            let oCurrentSlide = document.querySelector('.active');
            for (let slide of this.aoSlides) {
                slide.setAttribute('style', 'opacity:0;');
            }

            if (this.nSlideIndex == this.aoSlides.length) {

                this.toggleFirstSlide(this.nSlideIndex);
                this.nSlideIndex = 0;
                console.log(this.nSlideIndex, 'from arrow right');
                return this.nSlideIndex;
            } else {
                this.nSlideIndex++;
                oCurrentSlide.removeAttribute('class', 'active');
                this.aoSlides[this.nSlideIndex].setAttribute('style', 'opacity:1;');
                this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');
            }
        } catch (error) {
            this.nSlideIndex = 0;
            this.aoSlides[0].setAttribute('style', 'opacity:1;');

            this.aoSlides[0].setAttribute('class', 'active');
        }

        return this.nSlideIndex;

    }
    toggleLastSlide() {
        this.nSlideIndex = this.aoSlides.length - 1;
        let oCurrentSlide = document.querySelector('.active');
        oCurrentSlide.removeAttribute('class', 'active');
        for (let slide of this.aoSlides) {
            slide.setAttribute('style', 'opacity:0;');
        }
        this.aoSlides[this.aoSlides.length - 1].setAttribute('style', 'opacity:1;');
        this.aoSlides[this.aoSlides.length - 1].setAttribute('class', 'active')

        return this.nSlideIndex;
    }

    toggleFirstSlide() {
        this.nSlideIndex = 0;
        let oCurrentSlide = document.querySelector('.active');
        oCurrentSlide.removeAttribute('class', 'active');
        for (let slide of this.aoSlides) {
            slide.setAttribute('style', 'opacity:0;');
        }
        this.aoSlides[0].setAttribute('style', 'opacity:1;');
        this.aoSlides[0].setAttribute('id', 'active')
        return this.nSlideIndex;
    }




    //event listeners

    addEventListeners() {
        this.addEventListener('slideChange', e => {
            if (this.slideInterval++) {
                const changeEvent = new CustomEvent('slideChanged', {
                    detail: {
                        slideIndex: this.nSlideIndex,
                        bubbles: true,
                        detail: 'slide has changed'
                    }
                });
                this.dispatchEvent(changeEvent);
            }
        }, false);

        this.addEventListener('previousSlide', e => {
            if (this.slideInterval--) {
                const previousSlideEvent = new CustomEvent('previousSlide', {
                    detail: {
                        slideIndex: this.nSlideIndex,
                        bubbles: true,
                        detail: 'previous slide'
                    }
                });
                this.dispatchEvent(previousSlideEvent);
            }
        }, false);
    }


    uploadCompleteEvent() {
        const uploadEventComplete = new CustomEvent("uploading-complete", {
            detail: { message: "Created slides upload complete" },
            bubbles: true,
            cancelable: true
        });
        console.log('created slides upload complete');
        this.dispatchEvent(uploadEventComplete);
    }

    changeSlide() {

        const changeEvent = new CustomEvent('slideChanged', {
            detail: {
                slideIndex: this.nSlideIndex
            }
        });
        this.dispatchEvent(changeEvent);
    }

    previousSlideEvent() {
        const previousSlide = new CustomEvent("previous-slide", {

            detail: { slide: this.aoSlides[this.nSlideIndex - 1] },
            bubbles: true,
            cancelable: true,

        });

        this.dispatchEvent(previousSlide);
    }

    currentSlideEvent() {

        const currentSlide = new CustomEvent("current-slide", {
            detail: { slide: this.aoSlides[this.nSlideIndex] },
            bubbles: true,
            cancelable: true
        });

        this.dispatchEvent(currentSlide);

    }


    nextSlideEvent() {
        if ([this.nSlideIndex + 1] > this.aoSlides.length) {
            this.toggleFirstSlide(this.nSlideIndex);
            this.nSlideIndex = 0;
            console.log('restart function')
        }
        const nextSlide = new CustomEvent("next-slide", {
            detail: { slide: this.aoSlides[this.nSlideIndex + 1] },
            bubbles: true,
            cancelable: true
        });
        if (this.nSlideIndex == this.aoSlides.length - 1) {
            this.nSlideIndex = -1;
        }
        this.dispatchEvent(nextSlide);



    }

    //event should let you know if next slide has action to refresh slide
    refreshSlideEvent() {

        let refreshingSlide;

        if (this.nSlideIndex + 1 == this.aoSlides.length) {
            refreshingSlide = this.aoSlides[0].getAttribute('action');
        }

        // if (refreshingSlide === undefined || refreshingSlide === null) {
        //     // console.log('do no refreshing')
        // }
        if (this.nSlideIndex < [this.aoSlides.length - 1]) {
            if (this.aoSlides[this.nSlideIndex + 1].getAttribute('action') === "refresh") {

                let refreshSlide = new CustomEvent("refresh-slide", {
                    detail: { message: "need to re-request info for next slide if timer is up" },
                    bubbles: true,
                    cancelable: true
                })
                this.dispatchEvent(refreshSlide);
            }
        } else if ([this.nSlideIndex + 1] == this.aoSlides.length) {
            if (this.aoSlides[0].getAttribute('action') === "refresh") {
                let refreshSlide = new CustomEvent("refresh-slide", {
                    detail: { message: "need to re-request info for next slide if timer is up" },
                    bubbles: true,
                    cancelable: true
                })
                this.dispatchEvent(refreshSlide);
            }
        }
    }

    intervalEvent() {
        let intervalEvent = new Event('interval');
    }


}





// import SLIDE_SHOW_STYLES from './slideShow.scss';
// // import SLIDE from './components/slide/slide.js';
// import TEST_OBJECT from './testObject.json';

// export default class SLIDE_SHOW extends HTMLElement {

//     constructor() {

//         super();

//         this.attachShadow({ mode: 'open' });
//         this._state = {
//             layout: "default",
//             duration: null
//         };
//         this.slideIndex = "";

//         this.time = null;
//         this.slideLayout = "";
//         this.oPropsToStateNames = {
//             "layout": "sLayout"
//         }
//         this.aoTestObject = TEST_OBJECT;
//         this.totalLengthOfShow = null;
//         this.currentSlide = null;
//         this.previousSlide = null;
//         this.nextSlide = null;
//         this.refreshTime = null;

//     }

//     get style() {
//         return `<style>${SLIDE_SHOW_STYLES}</style>`;
//     }

//     get template() {
//         return `<slot></slot>`;
//     }

//     connectedCallback() {
//         // this._state = {
//         //     sLayout: this.getAttribute('layout') || ""
//         // }

//         this.render();


//     }

//     render() {
//         this.shadowRoot.innerHTML = `${this.style}${this.template}`;
//         this.createSlides();
//         this.slideDuration();
//         //this.initialDuration();
//         // this.showSlideNew();
//         //after running through slideshow, run refresh data
//         // this.refreshData();


//         //mutation observer used when item is added/removed from dom


//         let slideShow = document.querySelector('cui-slide-show');

//         slideShow.addEventListener('slideChanged', evt => {
//             console.log(evt.detail, 'slide changed?')
//         });
//         slideShow.addEventListener('keydown', evt => {
//             console.log('key down');
//         })





//     }


//     //initially creating slides
//     createSlides() {

//         for (let layout of this.aoTestObject) {
//             let sLayoutType = layout.layout;
//             let sSlideDuration = layout.duration;
//             let cuiSlideShow = document.querySelector('cui-slide-show');
//             let slide = document.createElement("cui-slide");
//             slide.setAttribute('layout', sLayoutType);
//             slide.setAttribute('duration', sSlideDuration);
//             slide.setAttribute('style', 'display:none;');
//             slide.setAttribute('class', "generated-slide");
//             // console.log(sSlideDuration,'duration');
//             cuiSlideShow.appendChild(slide);
//         }
//     }

//     removeSlides() {
//         let generatedSlides = document.querySelectorAll('.generated-slide');
//         for (let slide of generatedSlides) {
//             slide.remove();
//         }
//     }

//     //change duration of slides
//     slideDuration() {
// let allSlides = document.querySelectorAll('cui-slide');
// console.log(allSlides, 'all of them')
//         for (let duration of this.aoTestObject) {
//             let slideDuration = duration.duration;
//             let slideType = duration.layout;
//             this.time = slideDuration;
//             console.log(slideDuration, 'the duration?')
//         }

//     }


//     showSlide(slideIndex, time) {

//         for (let duration of this.aoTestObject) {
//             let slideDuration = duration.duration;
//             let slideType = duration.layout;
//             this.time = slideDuration;
//             // console.log(this.time, 'new?');
//         }
//         let nInitialTime;
//         let aoSlides = document.querySelectorAll('cui-slide');

//         //need to get duration of all slides instead of just slides from the test object
//         //all slides initially are hidden except 1st
//         for (let i = 0; i < aoSlides.length; i++) {

//             aoSlides[0].setAttribute('style', "display:block");
//             aoSlides[i].setAttribute('style', "display:none");
//         }
//         nInitialTime = Number(aoSlides[0].getAttribute('duration'));

//         try {

//             this.time = nInitialTime;

//             let slideInterval = setInterval(() => {

//                 let slides = document.querySelectorAll('cui-slide');
//                 // console.log(slides, 'should be 12')
//                 slides[slideIndex].setAttribute("style", "display:block");
//                 if (slideIndex == 0) {

//                     slides[slides.length - 1].setAttribute("style", "display:none");

//                 } else {
//                     slides[slideIndex - 1].setAttribute('style', "display:none");
//                 }

//                 //when specific type of slide is showing, increase/decrease amount of time allowed per slide
//                 let visibleSlide = slides[slideIndex];
//                 visibleSlide.setAttribute('style', "display:block");
//                 this.time = Number(visibleSlide.getAttribute('duration'));
//                 slideIndex++;
//                 if ([slideIndex + 1] > slides.length) {
//                     // slides[slideIndex - 1].style.display = "block";
//                     let lastSlide = slides[slideIndex - 1];
//                     // console.log(lastSlide, "the last slide", slideIndex, 'start over at the beginning')
//                     slideIndex = 0;

//                 }

//             }, this.time);


//         } catch (error) {
//             console.error('error in setInterval:', error, this.slideInterval);
//             // clearInterval(slideInterval);
//         }


//     }

//     //jump to different slide, record prior and next slide, when slide is added - refresh
//     showSlideNew(slideIndex) {

//         let aoSlides = document.querySelectorAll('cui-slide');
//         let slideShow = document.querySelector('cui-slide-show');
//         let timer = document.querySelector('slide-show-timer');

//         let totalTime = [];
//         for (let slide of aoSlides) {
//             let slideDuration = Number(slide?.time);
//             totalTime.push(slideDuration);
//             let slideType = slide?.layout;
//             this.time = slideDuration;
//             slide.setAttribute('style', 'display:none')
//             slide.addEventListener('uploading-complete', evt => {
//                 console.log('Uploading slides complete');
//             })
//         }

//         this.totalLengthOfShow;
//         for (let i = 0; i < totalTime.length; i++) {
//             this.totalLengthOfShow += totalTime[i];
//         }

//         //first slide initially showing as screen is loading
//         let nInitialTime;

//         this.uploadCompleteEvent();
//         aoSlides[0].setAttribute('style', 'display:none;');
//         timer.setAttribute('style', 'display:none;');
//         nInitialTime = Number(aoSlides[0].getAttribute('duration'));
//         let keyCount = 0;

//         document.addEventListener('keydown', evt => {
//             if (evt.key == "ArrowLeft") {

//                 console.log('change to previous slide')
//                 this.togglePreviousSlide(slideIndex);
//                 slideIndex = slideIndex - 1;
//                 this.time = 0;
//                 let currentSlide = document.querySelector('#active');
//                 let previousSlide = aoSlides[slideIndex - 1];


//                 if (slideIndex == 0) {
//                     keyCount++;
//                     // console.log(keyCount, 'counting keys')
//                 }
//                 if (keyCount >= 1) {
//                     this.toggleLastSlide(slideIndex);
//                     slideIndex = aoSlides.length - 1;
//                     // console.log(slideIndex, 'heh?')
//                     keyCount = 0;

//                 } else {
//                     let previousTime = Number(previousSlide.getAttribute('duration'));
//                     console.log(currentSlide, previousSlide, previousTime);
//                     this.time = previousTime;
//                 }

//                 // if (keyCount == 2) {
//                 //     this.toggleLastSlide(slideIndex);
//                 //     slideIndex = aoSlides.length - 1;

//                 //     keyCount = 0;

//                 // }

//             } else if (evt.key == "ArrowRight") {
//                 console.log('change to next slide')
//                 this.toggleNextSlide(slideIndex);
//                 slideIndex = slideIndex + 1;
//                 if (slideIndex == aoSlides.length) {
//                     // console.log(slideIndex, 'for next slide')
//                     this.toggleFirstSlide(slideIndex);
//                     slideIndex = 0;
//                 }
//             } else if (evt.key == "End") {
//                 console.log('change to last slide')
//                 this.toggleLastSlide(slideIndex);
//                 // console.log(slideIndex, 'before')
//                 slideIndex = aoSlides.length - 1;
//                 // console.log(slideIndex, 'after')
//             } else if (evt.key == "Home") {
//                 console.log('change to 1st slide');
//                 this.toggleFirstSlide(slideIndex);
//                 slideIndex = 0;

//             }
//             else if (evt.key == " ") {
                
//                 console.log('play/pause show', this.time, 'current slide duration');
//                 if(isPaused ==false){
//                     console.log('show should be paused');
//                     isPaused = true;
//                     clearInterval(slideInterval);
//                 }
//                 else {
//                     console.log('show should be playing');
//                     isPaused = false;
//                 }
                
//             }
//             console.log(slideIndex, 'returning?')
//             return slideIndex;

//         })

//         try {


//             this.time = nInitialTime;

//             // document.addEventListener('previous-slide', function (e) {
//             //     console.log(this.previousSlide, e);
//             // })
//             let slideInterval = setInterval(() => {

//                 let slides = document.querySelectorAll('cui-slide');
//                 timer.setAttribute('style', 'display:block;');

//                 if (slideIndex == 0) {

//                     slides[slideIndex].setAttribute('style', 'display:block');
//                     slides[slideIndex].setAttribute('id', 'active');
//                     slides[slides.length - 1].setAttribute('style', 'display:none');
//                     slides[slides.length - 1].removeAttribute('id', 'active');

//                 } else {
//                     slides[slideIndex - 1].setAttribute('style', 'display:none');
//                     slides[slideIndex - 1].removeAttribute('id', 'active');
//                 }

//                 //when specific type of slide is showing, increase/decrease amount of time allowed per slide

//                 // console.log(slideIndex, 'for visible slide')
//                 let visibleSlide = slides[slideIndex];
//                 visibleSlide.setAttribute('style', 'display:block');
//                 visibleSlide.setAttribute('id', 'active');


//                 this.previousSlide = slides[slideIndex - 1];
//                 this.currentSlide = visibleSlide;
//                 this.nextSlide = slides[slideIndex + 1];


//                 this.time = Number(visibleSlide.getAttribute('duration'));
//                 slideIndex++;
//                 if ([slideIndex + 1] > slides.length) {
//                     slideIndex = 0;
//                 }
//                 // console.log('Previous Slide:', this.previousSlide, 'Current Slide:', this.currentSlide, 'Next Slide:', this.nextSlide)

//                 // for (let slide of slides) {
//                 //     slide.addEventListener('previousSlide', evt => {
//                 //         console.log(evt.detail, 'previous')
//                 //     });
//                 //     slide.addEventListener('currentSlide', evt => {
//                 //         console.log(evt.detail, 'current ')
//                 //     });
//                 //     slide.addEventListener('nextSlide', evt => {
//                 //         console.log(evt.detail, 'previous')
//                 //     });


//                 // }



//                 return this.previousSlide, this.currentSlide, this.nextSlide, this.slideInterval;
//             }, this.time);

//         } catch (error) {
//             console.error('error in setInterval:', error, this.slideInterval);
//             // clearInterval(slideInterval);
//         }


//         return slideIndex;
//     }

//     slideShow(slideIndex){
//         let slideShowPlaying = true;
//         let slides = document.querySelectorAll('cui-slides');
//         slideIndex;
//         let currentSlide = 0
//         let slideTime = slideChange();

//         let slideShow = setInterval(() => {
//             changeDuration(slideIndex);
//             let slides = document.querySelectorAll('cui-slide');
//             // console.log(slides, 'should be 12')
//             slides[slideIndex].setAttribute("style", "display:block");
//             if (slideIndex == 0) {

//                 slides[slides.length - 1].setAttribute("style", "display:none");

//             } else {
//                 slides[slideIndex - 1].setAttribute('style', "display:none");
//             }

//             //when specific type of slide is showing, increase/decrease amount of time allowed per slide
//             let visibleSlide = this.aoSlides[slideIndex];
//             visibleSlide.setAttribute('style', "display:block");
//             this.time = Number(visibleSlide.getAttribute('duration'));
//             slideIndex++;
//             if ([slideIndex + 1] > slides.length) {
//                 // slides[slideIndex - 1].style.display = "block";
//                 let lastSlide = slides[slideIndex - 1];
//                 // console.log(lastSlide, "the last slide", slideIndex, 'start over at the beginning')
//                 slideIndex = 0;

//             }

//         }, slideTime);
//     }

//     slideChange(slidIndex){
//         let allSlides = document.querySelectorAll('cui-slide');
//         let slideDuration;
//         for(let slide of allSlides){
//            slideDuration = slide.getAttribute('duration');

//         }
//         console.log(slideDuration, 'the durations?')
//     }
//     showSlides(slideIndex){
//         let slides = document.querySelectorAll('cui-slides');
//         for (let slide of slides){
//             slide.setAttribute('style', 'display:none');
//         }
//     }

//     nextSlide(){
//         currentSlide = (currentSlide+1) % slides.length;
//         this.showSlides(currentSlide)


//     }


//     refreshData() {

//         this.refreshTime = 58000;

//         try {
//             let refresh = setInterval(() => {
//                 let aoSlides = document.querySelectorAll('cui-slide');
//                 let slideShow = document.querySelector('cui-slide-show');
//                 //removes all slides from slide show
//                 // slideShow.innerHTML = "";

//                 //removes slides that were created by this.aoTestObject
//                 this.removeSlides();
//                 console.log('generated slides were removed');

//                 //creates new slides from data only
//                 this.createSlides();
//                 console.log('new slides created from data')

//             }, this.refreshTime);
//         } catch (error) {
//             console.error('slides were not removed');

//         }
//     }

//     togglePreviousSlide(slideIndex) {
//         let slides = document.querySelectorAll('cui-slide');
//         let currentSlide = document.querySelector('#active');
//         let keyCount = 0;
//         //slides[slideIndex -2] == previous slide, slides[slideIndex -1] == current slide,slides[slideIndex] == next slide

//         for (let slide of slides) {
//             slide.setAttribute('style', 'display:none');
//         }

//         if (slideIndex == 0) {
//             keyCount++;
//             console.log(keyCount, 'counting keys')
//         }
//         if (keyCount >= 1) {
//             this.toggleLastSlide(slideIndex);
//             slideIndex = aoSlides.length - 1;
//             // console.log(slideIndex, 'heh?')
//             keyCount = 0;

//         } else {
//             currentSlide.removeAttribute('id', 'active');
//             slides[slideIndex - 1].setAttribute('style', 'display:block');
//             slides[slideIndex - 1].setAttribute('id', 'active');
//         }




//         // console.log(currentSlide, slides[slideIndex -2], 'the current slide showing');


//     }

//     toggleNextSlide(slideIndex) {
//         let slides = document.querySelectorAll('cui-slide');
//         let currentSlide = document.querySelector('#active');
//         // console.log(currentSlide, slides[slideIndex], 'need to remove active');
//         for (let slide of slides) {
//             slide.setAttribute('style', 'display:none');
//         }
//         currentSlide.removeAttribute('id', 'active');
//         slides[slideIndex].setAttribute('style', 'display:block');
//         slides[slideIndex].setAttribute('id', 'active')


//     }
//     toggleLastSlide(slideIndex) {
//         let slides = document.querySelectorAll('cui-slide');
//         let currentSlide = document.querySelector('#active');
//         currentSlide.removeAttribute('id', 'active');
//         for (let slide of slides) {
//             slide.setAttribute('style', 'display:none');
//         }
//         slides[slides.length - 1].setAttribute('style', 'display:block');
//         slides[slides.length - 1].setAttribute('id', 'active')


//     }

//     toggleFirstSlide(slideIndex) {
//         let slides = document.querySelectorAll('cui-slide');
//         let currentSlide = document.querySelector('#active');
//         currentSlide.removeAttribute('id', 'active');
//         for (let slide of slides) {
//             slide.setAttribute('style', 'display:none');
//         }
//         slides[0].setAttribute('style', 'display:block');
//         slides[0].setAttribute('id', 'active')


//     }

//     pauseShow(slideInterval, time) {
//         clearTimeout(slideInterval)
//     }

//     playShow(slideIndex, time) {
//         this.showSlideNew(slideIndex);
//     }

//     toggleSlideShow(isPaused, slideIndex) {
//         if (isPaused) {
//             this.playShow(slideIndex);
//             isPaused = false;
//         } else {
//             this.pauseShow(slideIndex);
//             isPaused = true;
//         }
//     }







//     //event listeners


//     uploadCompleteEvent() {
//         const uploadEventComplete = new CustomEvent("uploading-complete", {
//             detail: { message: "Uploading slides complete" },
//             bubbles: true,
//             cancelable: true
//         });
//         console.log('slides upload complete');
//         this.dispatchEvent(uploadEventComplete);
//     }

//     changeSlide(slideIndex) {
//         const changeEvent = new CustomEvent('slideChanged', { detail: { index: slideIndex } });
//         this.dispatchEvent(changeEvent);
//     }


//     previousSlideEvent() {
//         const previousSlide = new CustomEvent("previous-slide", {
//             detail: { message: "The previous slide is" },
//             //need to say which slide is the previous slide
//             previousIndex: previousIndex,
//             bubbles: true,
//             cancelable: true
//         });
//         console.log('this is the previous slide', this.previousSlide);
//         slide.dispatchEvent(previousSlide);
//     }

//     currentSlideEvent() {
//         const currentSlide = new CustomEvent("current-slide", {
//             detail: { message: `The current slide is ${this.currentSlide}` },
//             currentIndex: currentIndex,
//             bubbles: true,
//             cancelable: true
//         });
//         console.log('this is the current slide');
//         this.dispatchEvent(currentSlide);

//     }

//     nextSlideEvent() {
//         const nextSlide = new CustomEvent("next-slide", {
//             detail: { message: `The next slide is ${this.nextSlide}` },
//             nextIndex: nextIndex,
//             bubbles: true,
//             cancelable: true
//         });
//         console.log('this is the next slide');
//         this.dispatchEvent(nextSlide);

//     }

//     refreshSlide() {
//         let refreshSlide = new CustomEvent("refresh-slide", {
//             detail: { message: "slide to be refreshed" },
//             bubbles: true,
//             cancelable: true
//         })
//         console.log('refreshing slide data');
//         this.dispatchEvent(refreshSlide);
//     }

// }







// import SLIDE_SHOW_STYLES from './slideShow.scss';
// // import SLIDE from './components/slide/slide.js';
// import TEST_OBJECT from './testObject.json';

// export default class SLIDE_SHOW extends HTMLElement {

//     constructor() {

//         super();
//         this._connected = false;
//         this.attachShadow({ mode: 'open' });
//         this._state = {
//             sLayout: null,
//             nDuration: null,
//             sAction: null,
//             sTitle: null,
//             sStop: null,
//             sStart: null,
//             sPause: null
//         };


//         this.time = null;

//         this.slideLayout = "";
//         this.oPropsToStateNames = {
//             "duration": "nDuration",
//             "layout": "sLayout",
//             "title": "sTitle",
//             "action": "sAction",
//             "refreshRate": "nRefreshRate",
//             "stop": "sStop",
//             "start": "sStart",
//             "pause": "sPause"
//         }
//         this.aoTestObject = TEST_OBJECT;
//         // this.totalLengthOfShow = null;
//         // this.currentSlide = null;
//         // this.previousSlide = null;
//         // this.nextSlide = null;
//         this.refreshTime = null;
//         this.aoSlides = null;
//         this.slideInterval = null;
//         this.slideIntervalNew = null;
//         this.currentSlideDuration = null;
//         this.nextSlideDuration = null;
//         this.nDefaultTime = 10000;
//         this.nSlideIndex = 0;
//         this.intervalTimeout = null;


//     }

//     get style() {
//         return `<style>${SLIDE_SHOW_STYLES}</style>`;
//     }

//     get template() {
//         return `<slot></slot>`;
//     }
//     get state() {
//         let updatedState = {};
//         for (let [key, value] of Object.entries(this.oPropsToStateNames)) {

//             if (this._state[this.oPropsToStateNames[key]]) {
//                 updatedState[key] = this._state[this.oPropsToStateNames[key]];
//             }
//         }

//         return updatedState
//     }

//     setState(props) {
//         this._state = Object.assign(this._state, this.normalizeProps(props));

//         if (this._connected) {
//             this.render();
//         }
//     }

//     normalizeProps(props) {
//         let updatedProps = {};
//         for (let [key, value] of Object.entries(props)) {
//             if (this.oPropsToStateNames[key]) {
//                 updatedProps[this.oPropsToStateNames[key]] = value;

//             }
//         }
//         return updatedProps;
//     }

//     populateStateFromAttributes() {
//         this._state.sStop = (this.getAttribute('stop')) ? this.getAttribute('stop') : "";
//         this._state.sStart = (this.getAttribute('start')) ? this.getAttribute('start') : "";
//         this._state.sPause = (this.getAttribute('pause')) ? this.getAttribute('pause') : "";
//     }
//     connectedCallback() {
//         this._connected = true;
//         // this.populateStateFromAttributes();


//         this.render();

//     }

//     render() {


//         this.shadowRoot.innerHTML = `${this.style}${this.template}`;
//         this.createSlides();
//         this.addEventListeners();

//         // slideShow.addEventListener('slideChanged', evt => {
//         //     console.log(evt.detail, 'slide changed?')
//         // });


//         this.aoSlides = document.querySelectorAll('cui-slide');




//         for (let slide of this.aoSlides) {

//             //allows for all charts to render
//             slide.setAttribute('style', 'display:block');
//             // console.log(slide)
//             // slide.addEventListener('uploading-complete', evt => {
//             //     console.log('Uploading slides complete');
//             // });


//         }




//         let timer = document.querySelector('slide-show-timer');

//         //first slide not showing as screen is loading
//         this.uploadCompleteEvent();
//         // this.aoSlides[0].setAttribute('style', 'display:none;');
//         timer.setAttribute('style', 'display:none;');




//     }
//     //initially creating slides dynamically
//     createSlides(data) {
//         if (data == null) {
//             data = this.aoTestObject
//         }

//         for (let layout of data) {
//             let sLayoutType = layout.layout;
//             let sSlideDuration = layout.duration;
//             let sName = layout.name;
//             let sAction = layout.action;
//             let sTitle = layout.title;
//             let sFooter = layout.footer;
//             let cuiSlideShow = document.querySelector('cui-slide-show');
//             let slide = document.createElement("cui-slide");
//             slide.setAttribute('layout', sLayoutType);
//             slide.setAttribute('duration', sSlideDuration);
//             slide.setAttribute('class', "generated-slide");
//             slide.setAttribute('name', sName);
//             slide.setAttribute('action', sAction);
//             slide.setAttribute('title', sTitle);
//             slide.setAttribute('footer', sFooter);
//             slide.setAttribute('style', 'display:block;')
//             // console.log(sSlideDuration,'duration');
//             cuiSlideShow.appendChild(slide)

//             let leftChartInfo = layout.chartLocationLeft;

//             if (leftChartInfo) {

//                 let lChart = document.createElement("cui-chart-bar");
//                 let lChartDiv = document.createElement('div');
//                 let sLeftChartLocation = leftChartInfo.location;
//                 let sLeftChartTitle = leftChartInfo.chartTitle;
//                 let sLeftChartType = leftChartInfo.type;
//                 let sLeftChartId = leftChartInfo.id;

//                 lChartDiv.setAttribute("slot", "top-left-column")
//                 lChart.setAttribute("chartTitle", sLeftChartTitle);
//                 lChart.setAttribute('type', sLeftChartType);
//                 lChart.setAttribute('id', sLeftChartId);
//                 lChart.setAttribute('location', sLeftChartLocation);

//                 //temp chart ID
//                 lChart.setAttribute('id', "#example-left");

//                 lChartDiv.append(lChart);
//                 slide.appendChild(lChartDiv);
//                 // lDiv.appendChild(lChart);
//             }

//             // console.log(leftChartInfo)
//             let sRightChartInfo = layout.chartLocationRight;

//             if (sRightChartInfo) {

//                 let rChart = document.createElement("cui-chart");
//                 let rChartDiv = document.createElement('div');
//                 let sRightChartLocation = sRightChartInfo.location;
//                 let sRighthartTitle = sRightChartInfo.chartTitle;
//                 let sRightChartType = sRightChartInfo.type;
//                 let sRightChartId = sRightChartInfo.id;

//                 rChartDiv.setAttribute("slot", "top-right-column");
//                 rChart.setAttribute("chartTitle", sRighthartTitle);
//                 rChart.setAttribute('type', sRightChartType);
//                 rChart.setAttribute('id', sRightChartId);
//                 rChart.setAttribute('location', sRightChartLocation);

//                 //temp chart ID
//                 rChart.setAttribute('id', "#example-right");

//                 rChartDiv.append(rChart);
//                 slide.appendChild(rChartDiv);

//             };


//             let topChartInfo = layout.chartLocationTop;

//             if (topChartInfo) {

//                 let topRowChart = document.createElement("cui-chart");
//                 let topRowChartDiv = document.createElement("div");
//                 let sTopChartLocation = topChartInfo.location;
//                 let sTopChartTitle = topChartInfo.chartTitle;
//                 let sTopChartType = topChartInfo.type;
//                 let sTopChartId = topChartInfo.id;
//                 let sTopChartXAxisTickCount = topChartInfo.xAxisTickCount;

//                 topRowChartDiv.setAttribute("slot", "top-row")
//                 topRowChart.setAttribute("chartTitle", sTopChartTitle);
//                 topRowChart.setAttribute('type', sTopChartType);
//                 topRowChart.setAttribute('id', sTopChartId);
//                 topRowChart.setAttribute('location', sTopChartLocation);
//                 topRowChart.setAttribute('xAxisTickCount', sTopChartXAxisTickCount);

//                 //temp chart ID
//                 topRowChart.setAttribute('id', "#example-top-row");

//                 topRowChartDiv.append(topRowChart);
//                 slide.appendChild(topRowChartDiv);

//             };

//             let bottomChartInfo = layout.chartLocationBottom

//             if (bottomChartInfo) {
//                 let bottomRowChart = document.createElement("cui-chart");
//                 let bottomRowChartDiv = document.createElement('div');
//                 let sBottomChartLocation = bottomChartInfo.location;
//                 let sBottomChartTitle = bottomChartInfo.chartTitle;
//                 let sBottomChartType = bottomChartInfo.type;
//                 let sBottomChartId = bottomChartInfo.id;
//                 let sBottomChartYAxisGrid = bottomChartInfo.yAxisGrid;

//                 bottomRowChartDiv.setAttribute("slot", "bottom-row")
//                 bottomRowChart.setAttribute("chartTitle", sBottomChartTitle);
//                 bottomRowChart.setAttribute('type', sBottomChartType);
//                 bottomRowChart.setAttribute('id', sBottomChartId);
//                 bottomRowChart.setAttribute('location', sBottomChartLocation);
//                 bottomRowChart.setAttribute('yAxisGrid', sBottomChartYAxisGrid);

//                 //temp chart ID
//                 bottomRowChart.setAttribute('id', "#example-bottom-row");


//                 bottomRowChartDiv.append(bottomRowChart)
//                 slide.appendChild(bottomRowChartDiv);

//             };
//         }
//     }

//     renderCharts() {
//         console.log('from the render Charts fxn')
//         for (let slide of this.aoSlides) {

//             slide.setAttribute('style', 'display:block');

//         }

//     }

//     removeSlides() {
//         let generatedSlides = document.querySelectorAll('.generated-slide');
//         for (let slide of generatedSlides) {
//             slide.remove();
//         }
//     }

//     recalculateSlideCount() {
//         this.aoSlides = document.querySelectorAll('cui-slide');
//         console.log(this.aoSlides.length, 'should be different number before slides are added/removed');
//         clearInterval(this.slideInterval);
//         this.showSlideInterval();
//         //probably needs an if statement, if add/subtract slides occurs in the middle of slide show, get slideIndex based on if the slide has class "active",  try/catch statement- if you can't continue, start over slideshow with newly calculated slides? 
//     }

//     showSlideIntervalKeyListeners() {
//         document.addEventListener('keydown', evt => {
//             // this.resetValues();
//             let keyCount = 0;
//             if (evt.key == "ArrowLeft") {

//                 //previous slide
//                 // console.log(this.nSlideIndex, 'beginning of previous');
//                 clearTimeout(this.intervalTimeout);
//                 clearInterval(this.slideInterval);
//                 clearInterval(this.slideIntervalReset);


//                 if (this.nSlideIndex == 0) {
//                     this.toggleLastSlide();
//                     this.nSlideIndex = this.aoSlides.length - 1;
//                     // console.log(this.nSlideIndex, 'from keys');
//                     keyCount = 0;
//                     // console.log(this.nSlideIndex, 'from keys');
//                     return keyCount, this.nSlideIndex
//                 }

//                 else {

//                     this.nSlideIndex = this.nSlideIndex - 1;
//                     this.togglePreviousSlide(this.nSlideIndex);
//                 }

//                 // console.log(this.nSlideIndex, 'end of previous');
//                 // this._state.sStop = "stop";
//                 this.time = null;
//                 isPaused = true;
//                 return this.nSlideIndex;

//             } else if (evt.key == "ArrowRight") {
//                 //next slide

//                 clearTimeout(this.intervalTimeout);
//                 clearInterval(this.slideInterval);
//                 clearInterval(this.slideIntervalReset);

//                 if (this.nSlideIndex == this.aoSlides.length) {
//                     this.toggleFirstSlide();
//                     this.nSlideIndex = 0;
//                     return this.nSlideIndex;
//                 } else {

//                     this.toggleNextSlide();

//                 }
//                 this.time = null;
//                 isPaused = true;
//                 return this.nSlideIndex;

//             } else if (evt.key == "End") {
//                 //last slide
//                 clearTimeout(this.intervalTimeout);
//                 clearInterval(this.slideInterval);
//                 clearInterval(this.slideIntervalReset);
//                 this.toggleLastSlide();
//                 this.nSlideIndex = this.aoSlides.length - 1;
//                 this.time = null;
//                 isPaused = true;
//                 // this._state.sStop = "stop";
//                 console.log(this.nSlideIndex);
//                 return this.nSlideIndex;
//             } else if (evt.key == "Home") {
//                 //first slide
//                 clearTimeout(this.intervalTimeout);
//                 clearInterval(this.slideInterval);
//                 clearInterval(this.slideIntervalReset);
//                 this.toggleFirstSlide();
//                 this.nSlideIndex = 0;
//                 this.time = null;
//                 isPaused = true;
//                 // this._state.sStop = "stop";
//                 console.log(this.nSlideIndex);

//             }
//             else if (evt.key == " ") {
//                 // console.log('from slide show, needs to pause slide', isPaused)
//                 let timer = document.querySelector('slide-show-timer');
//                 let progressBar = timer.shadowRoot.querySelector('progress');

//                 if (isPaused == false) {
//                     // console.log('stop');

//                     clearTimeout(this.intervalTimeout);
//                     clearInterval(this.slideInterval);
//                     clearInterval(this.slideIntervalReset);
//                     this.time = null;
//                     isPaused = true;
//                     // this._state.sPause = "pause";
//                     // console.log(slideIndex);

//                 } else {
//                     clearTimeout(this.intervalTimeout);
//                     clearInterval(this.slideInterval);
//                     clearInterval(this.slideIntervalReset);


//                     this.showSlideInterval();
//                     // this.showSlideNew(slideIndex);
//                     console.log(this.nSlideIndex);
//                     isPaused = false;
//                     // this._state.sPlay = "play";

//                 }
//             }
//             return this.nSlideIndex;
//         });


//         // let slideShow = document.querySelector('cui-slide-show');
//         // slideShow.addEventListener('current-slide', evt => {
//         //     // console.log(evt.detail, 'current slide')
//         // });
//         // slideShow.addEventListener('next-slide', evt => {
//         //     // console.log(evt.detail, 'next slide')
//         // });
//         // slideShow.addEventListener('refresh-slide', evt => {
//         //     console.log(evt.detail)
//         // });
//         let isPaused = false;
//     }
//     showSlideInterval() {
//         for (let slide of this.aoSlides) {
//             slide.setAttribute('style', 'display:none;');
//         }
//         this.showActiveSlide(this.nSlideIndex);


//         if (this.nSlideIndex == this.aoSlides.length) {
//             this.nSlideIndex = 0;
//             return this.nSlideIndex;
//         }
        

// try {
// this.time = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
// } catch(error){
//     this.time = this.nDefaultTime
// }




//         let activeSlide = document.querySelector('.active');

//         this.slideInterval = setInterval(() => {

//             console.log(this.time, 'inside of interval', this.nSlideIndex);

//             this.nSlideIndex++;

//             // if(this.nSlideIndex+1 == this.aoSlides.length)
//             if (this.nSlideIndex + 1 == this.aoSlides.length) {
//                 this.nSlideIndex = 0;
//             }
//             for (let slide of this.aoSlides) {

//                 slide.setAttribute('style', 'display:none;');

//             }
//             // console.log(this.nSlideIndex, ' after increment in slide Interval');
//             //this.aoSlides[this.nSlideIndex].setAttribute('id', 'active');
//             //this.aoSlides[slideIndex].setAttribute('style', 'display:block');
//             this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');
//             this.aoSlides[this.nSlideIndex].setAttribute('style', 'display:block');


//             let intervalEvent = new Event('interval');
//             document.dispatchEvent(intervalEvent);

//             //events
//             this.changeSlide(slideIndex);
//             this.previousSlideEvent(slideIndex);
//             this.currentSlideEvent(slideIndex);
//             this.nextSlideEvent(slideIndex);

//             try {
//                 this.nextSlideEvent(this.nSlideIndex);
//                 this.showActiveSlide(this.nSlideIndex);
//             } catch (error) {
//                 this.nSlideIndex = 0;
//                 this.toggleFirstSlide(this.nSlideIndex);
//             }

//             this.refreshSlideEvent(this.nSlideIndex);



//             //to find duration to see if you need to stop and restart

//             this.currentSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));

//             // console.log('end');
//             // clearInterval(this.slideInterval);
//             this.time = null;
//             this.time = Number(this.aoSlides[slideIndex].getAttribute('duration'))
//             // this.showSlideNewRestart(slideIndex);

//             return this.nSlideIndex
//         }, this.time);
//         // console.log(this.time, 'between setinterval and set timeout');

//         this.intervalTimeout = setTimeout(() => {
//             // console.log('within setTimeout');
//             this.restartInterval();
//         }, this.time - 1)

//     }



//     restartInterval() {
//         this.nSlideIndex++;
//         clearInterval(this.slideInterval);
//         if (this.nSlideIndex == this.aoSlides.length) {
//             this.nSlideIndex = 0
//         }

//         this.showSlideInterval();

//     }



//     // changeDuration() {
//     //     this.aoSlides = document.querySelectorAll('cui-slide');
//     //     let currentSlide = document.querySelector('.active')
//     //     let currentDuration = Number(currentSlide.getAttribute('duration'));
//     //     this.time = currentDuration;

//     //     return currentDuration;

//     // }


//     //refresh Data within chart fxn
//     refreshData() {

//         this.refreshTime = 58000;

//         try {
//             let refresh = setInterval(() => {
//                 let aoSlides = document.querySelectorAll('cui-slide');
//                 let slideShow = document.querySelector('cui-slide-show');
//                 //removes all slides from slide show
//                 // slideShow.innerHTML = "";

//                 //removes slides that were created by this.aoTestObject
//                 this.removeSlides();
//                 console.log('generated slides were removed');

//                 //creates new slides from data only
//                 this.createSlides();
//                 console.log('new slides created from data')

//             }, this.refreshTime);
//         } catch (error) {
//             console.error('slides were not refreshed');

//         }
//     }

//     removeCurrentActiveSlide() {
//         let currentActiveSlide = document.getAttribute('.active');
//         currentActiveSlide.removeAttribute('class', 'active');
//         this.currentSlide.setAttribute('style', "display:none;");
//     }

//     showActiveSlide() {
//         this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');
//         this.aoSlides[this.nSlideIndex].setAttribute('style', 'display:block');
//         let timer = document.querySelector('slide-show-timer');
//         timer.setAttribute('style', 'display:block;');
//         // this.nSlideIndex++;
//     }

//     resetValues() {
//         this.time = null;
//     }

//     //fxns used with keyboard events
//     togglePreviousSlide() {
//         console.log(this.nSlideIndex, 'from toggle previous slide fxn')

//         let currentSlide = document.querySelector('.active');
//         for (let slide of this.aoSlides) {
//             slide.setAttribute('style', 'display:none;');
//         }
//         currentSlide.removeAttribute('class', 'active');

//         this.aoSlides[this.nSlideIndex].setAttribute('style', 'display:block');
//         this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');

//         return this.nSlideIndex

//     }

//     toggleNextSlide() {
//         try {

//             let currentSlide = document.querySelector('.active');
//             for (let slide of this.aoSlides) {
//                 slide.setAttribute('style', 'display:none;');
//             }

//             if (this.nSlideIndex == this.aoSlides.length) {

//                 this.toggleFirstSlide(this.nSlideIndex);
//                 this.nSlideIndex = 0;
//                 console.log(this.nSlideIndex, 'from arrow right');
//                 return this.nSlideIndex;
//             } else {
//                 this.nSlideIndex++;
//                 currentSlide.removeAttribute('class', 'active');
//                 this.aoSlides[this.nSlideIndex].setAttribute('style', 'display:block');
//                 this.aoSlides[this.nSlideIndex].setAttribute('class', 'active');
//             }
//         } catch (error) {
//             this.nSlideIndex = 0;
//             this.aoSlides[0].setAttribute('style', 'display:block');
//             this.aoSlides[0].setAttribute('class', 'active');
//         }
//         return this.nSlideIndex;

//     }
//     toggleLastSlide() {
//         this.nSlideIndex = this.aoSlides.length - 1;
//         let currentSlide = document.querySelector('.active');
//         currentSlide.removeAttribute('class', 'active');
//         for (let slide of this.aoSlides) {
//             slide.setAttribute('style', 'display:none;');
//         }
//         this.aoSlides[this.aoSlides.length - 1].setAttribute('style', 'display:block');
//         this.aoSlides[this.aoSlides.length - 1].setAttribute('class', 'active')

//         return this.nSlideIndex;
//     }

//     toggleFirstSlide() {
//         this.nSlideIndex = 0;
//         let currentSlide = document.querySelector('.active');
//         currentSlide.removeAttribute('class', 'active');
//         for (let slide of this.aoSlides) {
//             slide.setAttribute('style', 'display:none;');
//         }
//         this.aoSlides[0].setAttribute('style', 'display:block');
//         this.aoSlides[0].setAttribute('id', 'active')
//         return this.nSlideIndex;
//     }








//     //event listeners

//     addEventListeners() {
//         this.addEventListener('slideChange', e => {
//             if (this.slideInterval++) {
//                 const changeEvent = new CustomEvent('slideChanged', {
//                     detail: {
//                         slideIndex: this.nSlideIndex,
//                         bubbles: true,
//                         detail: 'slide has changed'
//                     }
//                 });
//                 this.dispatchEvent(changeEvent);
//             }
//         }, false);

//         this.addEventListener('previousSlide', e => {
//             if (this.slideInterval--) {
//                 const previousSlideEvent = new CustomEvent('previousSlide', {
//                     detail: {
//                         slideIndex: this.nSlideIndex,
//                         bubbles: true,
//                         detail: 'previous slide'
//                     }
//                 });
//                 this.dispatchEvent(previousSlideEvent);
//             }
//         }, false);
//     }


//     uploadCompleteEvent() {
//         const uploadEventComplete = new CustomEvent("uploading-complete", {
//             detail: { message: "Created slides upload complete" },
//             bubbles: true,
//             cancelable: true
//         });
//         console.log('created slides upload complete');
//         this.dispatchEvent(uploadEventComplete);
//     }

//     changeSlide() {
//         // let changeEvent = new Event('slide-change');
//         const changeEvent = new CustomEvent('slideChanged', {
//             detail: {
//                 slideIndex: this.nSlideIndex
//             }
//         });
//         this.dispatchEvent(changeEvent);
//     }

//     previousSlideEvent() {
//         const previousSlide = new CustomEvent("previous-slide", {

//             detail: { slide: this.aoSlides[this.nSlideIndex - 1] },
//             bubbles: true,
//             cancelable: true,

//         });

//         this.dispatchEvent(previousSlide);
//     }

//     currentSlideEvent() {

//         const currentSlide = new CustomEvent("current-slide", {
//             detail: { slide: this.aoSlides[this.nSlideIndex] },
//             bubbles: true,
//             cancelable: true
//         });
//         // console.log('this is the current slide');
//         this.dispatchEvent(currentSlide);

//     }


//     nextSlideEvent() {
//         if ([this.nSlideIndex + 1] > this.aoSlides.length) {
//             this.toggleFirstSlide(this.nSlideIndex);
//             this.nSlideIndex = 0;
//             console.log('restart function')
//         }
//         const nextSlide = new CustomEvent("next-slide", {
//             detail: { slide: this.aoSlides[this.nSlideIndex + 1] },
//             bubbles: true,
//             cancelable: true
//         });
//         if (this.nSlideIndex == this.aoSlides.length - 1) {
//             this.nSlideIndex = -1;
//         }
//         this.dispatchEvent(nextSlide);



//     }

//     //event should let you know if next slide has action to refresh slide
//     refreshSlideEvent() {

//         let refreshingSlide;

//         if (this.nSlideIndex + 1 == this.aoSlides.length) {
//             refreshingSlide = this.aoSlides[0].getAttribute('action');
//         }

//         if (refreshingSlide === undefined || refreshingSlide === null) {
//             // console.log('do no refreshing')
//         }
//         if (this.nSlideIndex < [this.aoSlides.length - 1]) {
//             if (this.aoSlides[this.nSlideIndex + 1].getAttribute('action') === "refresh") {

//                 let refreshSlide = new CustomEvent("refresh-slide", {
//                     detail: { message: "need to re-request info for next slide if timer is up" },
//                     bubbles: true,
//                     cancelable: true
//                 })
//                 this.dispatchEvent(refreshSlide);
//             }
//         } else if ([this.nSlideIndex + 1] == this.aoSlides.length) {
//             if (this.aoSlides[0].getAttribute('action') === "refresh") {
//                 let refreshSlide = new CustomEvent("refresh-slide", {
//                     detail: { message: "need to re-request info for next slide if timer is up" },
//                     bubbles: true,
//                     cancelable: true
//                 })
//                 this.dispatchEvent(refreshSlide);
//             }
//         }
//     }

//     intervalEvent() {
//         let intervalEvent = new Event('interval');
//     }


// }




// // progress bar is appropriately working based on slide that is showing
// //need to prevent slide show interval from either adding event listeners too many times or change set interval to set timeout that is repeatedly executed
// //interval in slide show is fixed, find out how to get event listeners added without repeating them
// //model timer set interval and set timeout to be similar to slide show