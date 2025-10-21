import SCREEN_TEMPLATE from './testslide.tpl.html';
import SCREEN_STYLES from './testslide.scss';

// Prototype page to test out charts and maps

export default class APP_TEST_SLIDE extends SCREEN {

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

            //  let progressBar = this.dSlideShow.shadowRoot.querySelector('.progress-bar-container');
            //  progressBar.setAttribute('style', 'opacity:0;');
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
     
             // this.dSlideShow.appendChild(uploadSlide)
         }
     
         #generateSlide(oSlideAttributes, vSlideContents) {
     
             if (vSlideContents) {
     
                 let dNewSlide = document.createElement('cui-slide');
     
                 for (let sAttribute in oSlideAttributes) {
                     dNewSlide.setAttribute(sAttribute, oSlideAttributes[sAttribute]);
                     dNewSlide.setAttribute("class", "generated");
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

                 return dNewSlide;
             }
             else {
     
                 console.error(`Skipping, no slide configuration provided`);
             }
     
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
     
         // ========================
         // DEFINE PAGE LIFECYCLE METHODS HERE    
         // All page lifecycle methods (init, preRender, render, unload, guard) are defined as `async` functions
         // ========================
     
         async init() {
     
            this.demoChartData = [
                {
                    "topic": "nimu-rpso-batch1",
                    "value": 0
                },
                {
                    "topic": "nimu-rpso-batch2",
                    "value": 100
                },
                {
                    "topic": "nimu-ols-account_summary",
                    "value": 5000
                },
                {
                    "topic": "nimu-ias-nap",
                    "value": 20000
                },
                {
                    "topic": "nimu-ols-create-account",
                    "value": 200
                },
                {
                    "topic": "nimu-ols-update-password",
                    "value": 1750
                },
                {
                    "topic": "nimu-irs-reverse-tranx",
                    "value": 3500
                },
                {
                    "topic": "nimu-pit-adjust",
                    "value": 35000
                },
                {
                    "topic": "nimu-rpso-delete-parcel",
                    "value": 750
                },
                {
                    "topic": "nimu-rpso-create-parcel",
                    "value": 8350
                }
            ];
     
         }
     
     
         async postRender() {
     
            this.dSlideShow = document.querySelector('cui-slide-show');
            this.uploadingSlide();

            let dNewSlide = document.createElement('cui-slide');
                dNewSlide.setAttribute('layout', 'twoRow');

            let dTopRow = document.createElement('div');
                dTopRow.setAttribute('slot', 'top-row');

            let dBottomRow = document.createElement('div');
                dBottomRow.setAttribute('slot', 'bottom-row');

            dNewSlide.append(dTopRow);
            dNewSlide.append(dBottomRow);
    
            this.dSlideShow.append(dNewSlide);
            
            let oTopRowSize = dTopRow.getBoundingClientRect();
            let oBottomRowSize = dTopRow.getBoundingClientRect();
            
            let iTopRowHeight = oTopRowSize.height;
            let iBottomRowHeight = oBottomRowSize.height;

            console.log(iTopRowHeight);
            console.log(iBottomRowHeight);

            // Create Charts here

            let dTopChart = document.createElement('cui-chart-bar');
                dTopChart.setAttribute("charttitle", "Slowest Namespace Function Response Times")
                dTopChart.setAttribute("chartsubtitle", "Request over last hour")
                dTopChart.setAttribute("direction", "hor")
                dTopChart.setAttribute("valueaxis", true)
                dTopChart.setAttribute("noxaxis", true)
                dTopChart.setAttribute("disabletable", true)
                dTopChart.setAttribute("strictdomain", true)
                dTopChart.setAttribute("height", iTopRowHeight)

            dTopRow.append(dTopChart);

            dTopChart.setState({
                data: this.demoChartData
            });
    
            let slides = document.querySelectorAll('cui-slide');
     
            if (slides.length > 1) {

                let uploadingSlide = document.querySelector('.uploading-slide');
                uploadingSlide.remove();
                

                let manualStart = this.dSlideShow.hasAttribute('manualstart');

                if (manualStart) {
                    this.dSlideShow.manualStart();
                } else {
                    this.dSlideShow.start();
                }
     
            }
            else {

                console.log("No new slide");
            }
     
         }
     
     }