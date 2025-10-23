import SCREEN_TEMPLATE from './slideScreen01.tpl.html';
import SCREEN_STYLES from './slideScreen01.scss';

export default class SLIDESCREEN01 extends SCREEN {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "Slideshow Application";
        this.sId = "";

        this.sScreenTemplate = SCREEN_TEMPLATE;
        this.sScreenStyles = SCREEN_STYLES;

        this.diInitialLoadRequest = null;

        this.oScreenCriteria = {
            "resourceId": "index",
            "renderModes": {
                "default": {
                    "layouts": []
                }
            }
        }

        this.dSlideShow = null;
        //for 1 hour 60*60*100
        this.iRefreshTime = 3 * 60 * 1000;
        this.iCycleCount = 0;
        this.iCycleRefresh = 2;

        // this.dTimer = null;
        // this.aoSlides = null;
        // this.nTime = null;
        // this.nSlideIndex = 0;
        // this.nDefaultTime = 10000;
        // this.nCurrentSlideDuration = null;
        // this.intervalTimeout = null;

        this.oColorRangeServiceResponseTime = {
            "0": "#a4c46c",
            "0.75": "#f5f111",
            "1": "#e3433b"
        }

    }

    uploadingSlide() {

        let uploadSlide = document.createElement('cui-slide');

        uploadSlide.setAttribute('layout', '');
        uploadSlide.setAttribute('active', '');
        uploadSlide.setAttribute('class', 'uploading-slide');
        let sDiv = document.createElement('div');
        sDiv.setAttribute('style', 'text-align:center;')
        sDiv.setAttribute('slot', 'default-content');
        sDiv.innerHTML = `<span class="loader"></span><p>Please wait while data is being generated</p>`

        uploadSlide.append(sDiv);
        this.dSlideShow.append(uploadSlide);

    }

    #generateSlide(oSlideAttributes, vSlideContents) {

        if (vSlideContents) {

            let dNewSlide = document.createElement('cui-slide');


            for (let sAttribute in oSlideAttributes) {
                dNewSlide.setAttribute(sAttribute, oSlideAttributes[sAttribute]);
                dNewSlide.setAttribute("class", "generation");
            }

            if (typeof vSlideContents === "string") {

                console.warn(`String assignment not yet supported`);

            }
            else if (vSlideContents instanceof HTMLElement) {

                let dSlotDiv = document.createElement('div');

                dSlotDiv.append(vSlideContents)

                dNewSlide.append(dSlotDiv);

            }
            else if (typeof vSlideContents === "object") {

                for (let sSlot in vSlideContents) {

                    let dSlotDiv = document.createElement('div');
                    dSlotDiv.setAttribute("slot", sSlot);

                    if (typeof vSlideContents[sSlot] === "string") {

                        console.warn(`String assignment not yet supported`);
                    }
                    else if (vSlideContents[sSlot] instanceof HTMLElement) {

                        dSlotDiv.append(vSlideContents[sSlot])
                    }

                    dNewSlide.append(dSlotDiv);
                }
            }

            this.dSlideShow.append(dNewSlide);
        }
        else {

            console.error(`Skipping, no slide configuration provided`);
        }

    }

    #generateMenu() {

    }

    #createChart(oAttributes, aoData) {
        if (oAttributes) {
            let dChart = document.createElement('cui-chart-bar');

            for (let sAttribute in oAttributes) {
                dChart.setAttribute(sAttribute, oAttributes[sAttribute]);

            }
            dChart.setState({
                data: aoData
            });


            if (dChart.shadowRoot == null || dChart.shadowRoot == undefined || dChart.shadowRoot == "") {
                return `
                     <div>
                         <h1>There is no information to be displayed</h1>
                     </div>
                     `
            }
            return dChart;
        }
    }

    #createCounter(oAttributes, iValue) {

        let dCounter = document.createElement('cui-counter');

        for (let sAttribute in oAttributes) {
            dCounter.setAttribute(sAttribute, oAttributes[sAttribute]);
        }

        return dCounter;
    }

    //refreshing show based on total time, ex) after 1 hr, for manual start
    #refreshSlideShow() {
        let refresh = setInterval(() => {
            window.location.reload();
        }, this.iRefreshTime)

    }

  
    #topTopics(aoSource, iLimit = 10, bTop = true, bSortDesc = true, sValueKey = "value") {

        // Default to sort descending
        function fSortDesc(a, b) {

            return b[sValueKey] - a[sValueKey]
        }

        function fSortAsc(a, b) {

            return a - b;
        }

        let aoLimitedDataset = null;

        if (bTop) {

            aoLimitedDataset = aoSource.slice(0, iLimit);
        }
        else {

            aoLimitedDataset = aoSource.slice((-1 * iLimit));
        }

        if (aoLimitedDataset && aoLimitedDataset.length) {

            if (bSortDesc) {

                aoLimitedDataset.sort(fSortDesc);
            }
            else {

                aoLimitedDataset.sort(fSortAsc);
            }


            return aoLimitedDataset;
        }

        return null;
    }

    #cleanupTime(initialTime, bToString = false) {

        const milliseconds = Math.floor(initialTime * 1000);
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.abs(hours / 24);
        // const months = Math.floor(seconds / (60 * 60 * 24 * 30));

        const remainingMillisconds = milliseconds % 1000;
        const remainingSeconds = seconds % 60;
        const remainingMinutes = minutes % 60;
        const remainingHours = hours % 24;


        if (bToString) {

            let sOutputString = "";

            if (days > 0) {
                sOutputString += ` ${days}d`;
            }

            if (remainingHours > 0) {
                sOutputString += ` ${remainingHours}h`;
            }

            if (remainingMinutes > 0) {
                sOutputString += ` ${remainingMinutes}m`;
            }

            if (remainingSeconds > 0) {

                if (remainingMillisconds > 0) {

                    sOutputString += ` ${remainingSeconds}.${remainingMillisconds}s`;
                }
                else {
                    sOutputString += ` ${remainingSeconds}s`;
                }

            }
            else {

                sOutputString += ` ${remainingMillisconds}ms`;
            }

            return sOutputString.trim();
        }

        return {
            "days": days,
            "hours": remainingHours,
            "minutes": remainingMinutes,
            "seconds": remainingSeconds,
            "milliseconds": remainingMillisconds
        };

    }

    // ========================
    // DEFINE PAGE LIFECYCLE METHODS HERE    
    // All page lifecycle methods (init, preRender, render, unload, guard) are defined as `async` functions
    // ========================

    async init() {


    }


    async postRender() {



        this.dSlideShow = document.querySelector('cui-slide-show');
        this.uploadingSlide();

        let asNamespaces = cAPP.getNamespaces();

        //asNamespaces = [];

        // Loop each namespace
        asNamespaces.forEach((sNamespace) => {

            let oNamespaceDef = cAPP.getNamespaceDef(sNamespace);

            if (oNamespaceDef) {

                // Defautl config variables

                let oSlideConfig = {};

                // where slide title, layout and name space are defined

                let oSlideAttributes = {
                    title: oNamespaceDef.name,
                    "data-namespace": sNamespace,
                    layout: null,
                    duration: 5000
                };

                let aoSlowestResponseTimes = this.#topTopics(oNamespaceDef.data.avgFunctionResponseTime.aoAvgReqTime, 10, false);
                let aoFastestResponseTimes = this.#topTopics(oNamespaceDef.data.avgFunctionResponseTime.aoAvgReqTime, 10, true, false);

                // Filter out no requests;
                if (aoSlowestResponseTimes !== null) {

                    if (aoSlowestResponseTimes.length === 10) {
                        console.log(aoSlowestResponseTimes);
                    }

                    aoSlowestResponseTimes = aoSlowestResponseTimes.map((oDataPoint) => {

                        return {
                            ...oDataPoint,
                            labelValue: this.#cleanupTime(oDataPoint.value, true)
                        }

                    });
                }

                if (aoFastestResponseTimes) {
                    aoFastestResponseTimes = aoFastestResponseTimes.map((oDataPoint) => {

                        return {
                            ...oDataPoint,
                            labelValue: this.#cleanupTime(oDataPoint.value, true)
                        }

                    });
                }

                let aoResponseTimeGraphs = {
                    aiNoResponse: oNamespaceDef.data.avgFunctionResponseTime.aNoRequest,
                    aoSlowestResponseTimes: aoSlowestResponseTimes,
                    aoFastestResponseTimes: aoFastestResponseTimes
                }

                if (aoResponseTimeGraphs.aoSlowestResponseTimes === null && aoResponseTimeGraphs.aoFastestResponseTimes === null) {

                    console.warn(`Skipping namespace: ${sNamespace} - No Response times`)

                }
                else {

                    // Check if we have both response times
                    if (aoResponseTimeGraphs.aoSlowestResponseTimes !== null && aoResponseTimeGraphs.aoFastestResponseTimes !== null) {


                        if (aoResponseTimeGraphs.aoSlowestResponseTimes.length === 1 && aoResponseTimeGraphs.aoFastestResponseTimes.length === 1) {

                            console.log("Only one response time")

                        }
                        else {

                            oSlideAttributes.layout = "twoRow";

                            oSlideConfig = {
                                "top-row": this.#createChart(
                                    {
                                        charttitle: "Slowest Namespace Function Response Times",
                                        chartsubtitle: "Request over last hour",
                                        direction: "hor",
                                        valueaxis: true,
                                        noxaxis: true,
                                        disabletable: true,
                                        strictdomain: true,
                                        colorrange: JSON.stringify(this.oColorRangeServiceResponseTime)
                                    },
                                    aoResponseTimeGraphs.aoSlowestResponseTimes
                                ),
                                "bottom-row": this.#createChart(
                                    {
                                        charttitle: "Fastest Namespace Function Response Times",
                                        chartsubtitle: "Request over last hour",
                                        direction: "hor",
                                        valueaxis: true,
                                        noxaxis: true,
                                        disabletable: true,
                                        strictdomain: true,
                                        colorrange: JSON.stringify(this.oColorRangeServiceResponseTime)
                                    },
                                    aoResponseTimeGraphs.aoFastestResponseTimes
                                ),
                            }
                        }

                    }
                    else {

                        oSlideAttributes.layout = "default"
                    }

                }

                // Top/Bottom Row, create charts

                // Only create slides that have layouts defined
                if (oSlideAttributes.layout) {

                    // if (sNamespace === "dtf-dev-nimbus-ias") {
                    //     this.#generateSlide(oSlideAttributes, oSlideConfig);
                    // }

                    this.#generateSlide(oSlideAttributes, oSlideConfig);
                }

                // ============================================================

                // Reset for next slide
                oSlideConfig = {};

                let oSlideConfigTotals = {};

                let oSlideAttributesTotals = {
                    title: oNamespaceDef.name,
                    "data-namespace": sNamespace,
                    layout: "twoByOne",
                    duration: 5000
                };

                let iTotalRequestCount = 0;

                oNamespaceDef.data.totalFunctionRequests.aoAvgReqTime.forEach((oItem) => {

                    //console.log(oItem);

                    iTotalRequestCount += parseInt(oItem.value)

                })

                oSlideConfigTotals = {
                    "top-left-column": this.#createCounter({
                        "title": "Total Namespace Functions",
                        "count": oNamespaceDef.functions.length
                    }),
                    "top-right-column": this.#createCounter({
                        "title": "Total Function Requests",
                        "sub-title": "Request over last hour",
                        "count": iTotalRequestCount
                    })
                }

                // if (sNamespace === "dtf-dev-nimbus-ias") {

                //     this.#generateSlide(oSlideAttributesTotals, oSlideConfigTotals)

                // }

                this.#generateSlide(oSlideAttributesTotals, oSlideConfigTotals)

            }

        });

        let slides = document.querySelectorAll('cui-slide');

        if (slides.length > 1) {

            console.log("slideshow");

            let progressBar = this.dSlideShow.shadowRoot.querySelector('.progress-bar-container');
            progressBar.setAttribute('style', 'opacity:1;');

            let uploadingSlide = document.querySelector('.uploading-slide');
            uploadingSlide.remove();



            let manualStart = this.dSlideShow.hasAttribute('manualstart');
            console.log("manual start", manualStart);
            document.addEventListener('refresh-show', evt => {
                window.location.reload();
            });

            if (manualStart) {
                console.log("manualStart");
                this.dSlideShow.manualStart();
                //refresh slideshow, based on time defined as this.iRefreshTime
                this.#refreshSlideShow();
            } else {
                this.dSlideShow.start();


                //refresh slideshow, sum of slide durations = 1 cycle, this.iCycleCount increments after 1 full cycle, number of cycles to be completed before refresh defined as this.iCycleRefresh
                // this.#refreshCycles();

            }

        }

    }



}