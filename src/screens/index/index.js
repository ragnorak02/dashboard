import SCREEN_TEMPLATE from './index.tpl.html';
import SCREEN_STYLES from './index.scss';

// Prototype page to test out charts and maps

export default class APP_DEFAULT_INDEX extends SCREEN {

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

            this.oColorRangeServiceResponseTime = {
                "0": "#a4c46c",
                "0.75": "#f5f111",
                "1": "#e3433b"
            };

            this.iRecycleEvery = 2;
            this.iCycleCount = 0;
     
        }
     
        uploadingSlide() {

            let uploadSlide = document.createElement('cui-slide');
                uploadSlide.setAttribute('layout', '');
                uploadSlide.setAttribute('active', '');
                uploadSlide.setAttribute('class', 'uploading-slide');

            let sDiv = document.createElement('div');
                sDiv.setAttribute('slot', 'default-content');
                sDiv.innerHTML = `<span class="loader"></span><p>Please wait while data is being generated</p>`
            
            uploadSlide.append(sDiv);
            this.dSlideShow.append(uploadSlide);
        }
     
        #generateSlide(oSlideAttributes, bAppend = true) {
     
            let dNewSlide = document.createElement('cui-slide');
     
            for (let sAttribute in oSlideAttributes) {
                dNewSlide.setAttribute(sAttribute, oSlideAttributes[sAttribute]);
                dNewSlide.setAttribute("class", "generated");
            }

            if (bAppend) {
                this.dSlideShow.append(dNewSlide);
            }

            return dNewSlide;
        }
     
        #createBarChart(oAttributes, aoData, sSlotTarget, dSlide) {

            if (oAttributes) {
                 
                let dChart = document.createElement('cui-chart-bar');
     
                 for (let sAttribute in oAttributes) {
                     dChart.setAttribute(sAttribute, oAttributes[sAttribute]);
                 }

                let dChartContainer = document.createElement('div');
                    dChartContainer.setAttribute('slot', sSlotTarget);
                    dChartContainer.append(dChart);

                // Add chart to target slot
                dChartContainer.append(dChart);

                // Add slotted div to slide
                dSlide.append(dChartContainer);

                // Now apply data
                dChart.setState({
                    data: aoData
                });
     
                return dChart;
             }
        }

        #createLineChart(oAttributes, aoData, sSlotTarget, dSlide) {
         
            if (oAttributes && Array.isArray(aoData)) {
                 
                let dChart = document.createElement('cui-chart-line');
     
                 for (let sAttribute in oAttributes) {
                     dChart.setAttribute(sAttribute, oAttributes[sAttribute]);
                 }

                let dChartContainer = document.createElement('div');
                    dChartContainer.setAttribute('slot', sSlotTarget);
                    dChartContainer.append(dChart);

                // Add chart to target slot
                dChartContainer.append(dChart);

                // Add slotted div to slide
                dSlide.append(dChartContainer);

                // Now apply data
                dChart.setState({
                    data: aoData
                });
     
                return dChart;
             }
            
        }
     
        #createCounter(oAttributes, sSlotTarget, dSlide) {

            let dCounter = document.createElement('cui-counter');

            let dChartContainer = document.createElement('div');
                dChartContainer.setAttribute('slot', sSlotTarget);
                dChartContainer.append(dCounter);
    
            for (let sAttribute in oAttributes) {
                dCounter.setAttribute(sAttribute, oAttributes[sAttribute]);
            }
            
            dSlide.append(dChartContainer)
        }

        #createNegativeState(sTitle, sSubTitle = false, sMessage = "No message provided!", sSlotTarget) {

            let dNegativeStateContainer = document.createElement('div');
            dNegativeStateContainer.setAttribute('slot', sSlotTarget);
            
            let dNegativeStateInnerContainer = document.createElement('div');
                dNegativeStateInnerContainer.classList.add('negavite-state');

            dNegativeStateContainer.append(dNegativeStateInnerContainer);

            let dNegativeStateHeader = document.createElement('header');

            let dNegativeStateTitle = document.createElement('div');
                dNegativeStateTitle.classList.add('title');
                dNegativeStateTitle.append(document.createTextNode(sTitle));

                dNegativeStateHeader.append(dNegativeStateTitle);

            if (sSubTitle && typeof(sSubTitle) === "string"  && sSubTitle.length) {

                let dNegativeStateSubTitle = document.createElement('div');
                    dNegativeStateSubTitle.classList.add('subtitle');
                    dNegativeStateSubTitle.append(document.createTextNode(sSubTitle));

                dNegativeStateHeader.append(dNegativeStateSubTitle);
            }

            dNegativeStateInnerContainer.append(dNegativeStateHeader);

            let dNegativeMessageContainer = document.createElement('div');
                dNegativeMessageContainer.classList.add('negative-message-container');
            
            let dNegativeStateMessage = document.createElement('p');
                dNegativeStateMessage.append(document.createTextNode(sMessage));

            dNegativeMessageContainer.append(dNegativeStateMessage);

            dNegativeStateInnerContainer.append(dNegativeMessageContainer);

            return dNegativeStateContainer;
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

        #handleSlideshowCycle() {

            if (this.iCycleCount < this.iRecycleEvery) {
                this.iCycleCount += 1;
            }
            else {
                this.dSlideShow.stop();

                // Reloading the page reloads the slideshow with new data.
                window.location.reload();
            }

        }
     
        // ========================
        // DEFINE PAGE LIFECYCLE METHODS HERE    
        // All page lifecycle methods (init, preRender, render, unload, guard) are defined as `async` functions
        // ========================
     
        async init() {}
     
     
        async postRender() {
            
            this.dSlideShow = document.querySelector('cui-slide-show');
            this.uploadingSlide();

            this.dSlideShow.addEventListener('cycle-restart', this.#handleSlideshowCycle.bind(this))
     
            let asNamespaces = cAPP.getNamespaces();

            let asNamspecesSkipped = [];

            // Loop each namespace
            asNamespaces.forEach((sNamespace) => {
                
                let oNamespaceDef = cAPP.getNamespaceDef(sNamespace);

                // Create basic slide configs
                let oSlideAttributes = {
                    title: oNamespaceDef.name,
                    "data-namespace": sNamespace,
                    layout: null,
                    duration: 5000
                };

                if (oNamespaceDef && oNamespaceDef.functions.length >= 1) {

                    // Service Response Time Slides
                    // ======================================================

                    // Get Data
                    let aoSlowestResponseTimes = this.#topTopics(oNamespaceDef.data.avgFunctionResponseTime.aoAvgReqTime, 10, false);
                    let aoFastestResponseTimes = this.#topTopics(oNamespaceDef.data.avgFunctionResponseTime.aoAvgReqTime, 10, true, false);

                    // Check to see if any response information was returned
                    if (aoSlowestResponseTimes !== null && aoFastestResponseTimes !== null) {

                        let oResponseTimeSlide = Object.assign({}, oSlideAttributes);

                        let bMatchingTimes = true;

                        let asSlowTopics = aoSlowestResponseTimes.map((oServices) => oServices.topic);
                        let asFastTopics = aoFastestResponseTimes.map((oServices) => oServices.topic);

                        for (let s = 0, sLen = asFastTopics.length; s < sLen; s++) {

                            if (asSlowTopics.indexOf(asFastTopics[s]) === -1) {
                                bMatchingTimes = false;
                                break;
                            }

                        }

                        if (bMatchingTimes) {

                            oResponseTimeSlide.layout = "default-content";

                            let bRender = true;

                            // if (sNamespace !== "dtf-dev-nimbus-rpsonline") {
                            //     bRender = false;
                            // }

                            let dNewSlide = this.#generateSlide(oResponseTimeSlide, bRender);

                            let oSingleResponseTimeAttribute = {
                                charttitle: "Service response times",
                                chartsubtitle: "Request over last hour, fastest to slowest",
                                direction: "hor",
                                valueaxis: true,
                                noxaxis: true,
                                disabletable: true,
                                strictdomain: true,
                                constrainheight: true,
                                valueaxisdatatype: "time",
                                colorRange: JSON.stringify(this.oColorRangeServiceResponseTime)
                            }

                            this.#createBarChart(oSingleResponseTimeAttribute, aoFastestResponseTimes, "default-content", dNewSlide);

                        }
                        else {

                            oResponseTimeSlide.layout = "twoRow";

                            let bRender = true;

                            if (sNamespace !== "dtf-dev-nimbus-rpsonline") {
                                bRender = false;
                            }

                            let dNewSlide = this.#generateSlide(oResponseTimeSlide, bRender);

                            let oSlowResponseTimeAttribute = {
                                charttitle: "Slowest service response times",
                                chartsubtitle: "Request over last hour",
                                direction: "hor",
                                valueaxis: true,
                                noxaxis: true,
                                disabletable: true,
                                strictdomain: true,
                                constrainheight: true,
                                valueaxisdatatype: "time",
                                colorRange: JSON.stringify(this.oColorRangeServiceResponseTime)
                            }

                            this.#createBarChart(oSlowResponseTimeAttribute, aoSlowestResponseTimes, "top-row", dNewSlide);

                            let oFastResponseTimeAttribute = {
                                charttitle: "Fastest service response times",
                                chartsubtitle: "Request over last hour",
                                direction: "hor",
                                valueaxis: true,
                                noxaxis: true,
                                disabletable: true,
                                strictdomain: true,
                                constrainheight: true,
                                valueaxisdatatype: "time",
                                colorRange: JSON.stringify(this.oColorRangeServiceResponseTime)
                            }

                            this.#createBarChart(oFastResponseTimeAttribute, aoFastestResponseTimes, "bottom-row", dNewSlide);

                        }

                    }
                    else {

                        let bRender = true;

                        let oNoResponseTimeSlide = Object.assign({}, oSlideAttributes);
                            oNoResponseTimeSlide.layout = "default-content";

                        // Generate the slide
                        let dNewSlide = this.#generateSlide(oNoResponseTimeSlide, bRender);

                        let dContents = this.#createNegativeState(
                            "Service response times",
                            "Request over last hour",
                            "No service requests recieved in the last hour!",
                            "default-content"
                        );

                        dNewSlide.append(dContents);
                    }

                    // Namespace Counts
                    // ======================================================

                    let bRender = true;
     
                    let oNamespaceCountsSlide = Object.assign({}, oSlideAttributes);

                    oNamespaceCountsSlide.layout = "twoByOne";

                    let dNewCountSlide = this.#generateSlide(oNamespaceCountsSlide, bRender);

                    let iTotalRequestCount = 0;
    
                    oNamespaceDef.data.totalFunctionRequests.aoRequestCount.forEach((oItem) => {
                        iTotalRequestCount += parseInt(oItem.value)
                    });

                    // Create Total Function Count
                    this.#createCounter({
                        "title": "Total Namespace Functions",
                        "count": (oNamespaceDef.functions) ? oNamespaceDef.functions.length : 0
                    }, "top-left-column", dNewCountSlide);

                    // Create Total Request Count
                    this.#createCounter({
                        "title": "Total Function Requests",
                        "sub-title": "Request over last hour",
                        "count": iTotalRequestCount
                    }, "top-right-column", dNewCountSlide);

                    if (oNamespaceDef.data.totalFunctionRequestsPerDay !== null) {

                        this.#createLineChart({
                            charttitle: `Total request over last 14 days ${sNamespace}`,
                            xaxisdatatype: "date",
                            subtype: "time",
                            yaxistickcount: "7",
                            xaxistickcount: "14",
                            xaxistickformat: "%m/%d",
                            constrainheight: true,
                            disabletable: true,
                            axisgrid: true,
                            ymindomain: 0,
                        }, oNamespaceDef.data.totalFunctionRequestsPerDay, "bottom-row", dNewCountSlide);

                    }
                    else {

                        dNewCountSlide.append(this.#createNegativeState(
                            "Total request over the last 14 days",
                            false,
                            "No service requests in the last 14 days!",
                            "bottom-row"
                        ));
                    }

                }
                else {
                    asNamspecesSkipped.push(sNamespace);
                }
     
             });

             if (asNamspecesSkipped.length) {
                console.log("Namespaces skipped");
                console.log(asNamspecesSkipped);
             }
     
             let slides = document.querySelectorAll('cui-slide');
     
             if (slides.length > 1) {

                let progressBar = this.dSlideShow.shadowRoot.querySelector('.progress-bar-container');
                    progressBar.setAttribute('style', 'opacity:1;');
     
                let uploadingSlide = document.querySelector('.uploading-slide');
                    uploadingSlide.remove();
        

                let manualStart = this.dSlideShow.hasAttribute('manualstart');

                if (manualStart) {
                //     this.dSlideShow.manualStart();
                // } else {
                    this.dSlideShow.start();
                }
     
             }
     
        }
     
     }
