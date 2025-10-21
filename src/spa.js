//Primary App class for CUI SPA apps
import CUI_APP from '@nys-cui/cui-spa-app-class';

//SPA Modules
import * as DOM from './modules/dom.js';

//First Party Web Components
import BUTTON from '@nys-cui/cui-button';
import CHECKBOX from '@nys-cui/cui-field-checkbox';
import CUI_WC_FIELD_CHECK_GROUP from '@nys-cui/cui-field-check-group';
import LISTBOX from '@nys-cui/cui-field-listbox';
import CUI_WC_FIELD_RADIO_GROUP from '@nys-cui/cui-field-radio-group';
import SELECT from '@nys-cui/cui-field-select';
import TEXT from '@nys-cui/cui-field-text';
import DATE from '@nys-cui/cui-field-text-date';
import FORM from '@nys-cui/cui-form';
import ICON from '@nys-cui/cui-icon';
import LINK from '@nys-cui/cui-link';
import CUI_MESSAGE from '@nys-cui/cui-message'
import CUI_MESSAGE_LIST from '@nys-cui/cui-message-list';
import SECTION from '@nys-cui/cui-section';
import { TABLE, TABLE_COL, TABLE_FOOT } from '@nys-cui/cui-table';
import { TOAST, TOASTER } from '@nys-cui/cui-toast';
import { TREE, TREE_BRANCH, TREE_LEAF, TREE_FILTER } from '@nys-cui/cui-tree';

// import CUI_SPINNER from '@nys-cui/cui-spinner';

// import PIE from '@nys-cui/cui-chart-pie';
import LINE_CHART from '@nys-cui/cui-chart-line';
import BAR_CHART from '@nys-cui/cui-chart-bar';

//Project Specific Web Components
import SLIDE_SHOW from './components/slideShow/slideShow.js';
// import TIMER from './components/timer/timer.js';
import SLIDE from './components/slide/slide.js';
import COUNTER from './components/counter/counter.js';



class APP extends CUI_APP {

    #pvt = {
        oNamespaces: {}
    };

    constructor() {
        super('script#spa');

        this.oOnline = {
            "status": true
        };

        // this.sAppLayout = "main";
        this.sApp404Screen = "404";

        //define custom elements based on imports
        //customElements.define('[tag name in html]', [imported class name]);
        customElements.define('cui-button', BUTTON);
        customElements.define('cui-checkbox', CHECKBOX);
        customElements.define('cui-check-group', CUI_WC_FIELD_CHECK_GROUP);
        customElements.define('cui-listbox', LISTBOX);
        customElements.define('cui-radio-group', CUI_WC_FIELD_RADIO_GROUP);
        customElements.define('cui-select', SELECT);
        customElements.define('cui-text', TEXT);
        customElements.define('cui-date', DATE);
        customElements.define('cui-form', FORM);
        customElements.define('cui-icon', ICON);
        customElements.define('cui-link', LINK);
        customElements.define("cui-message", CUI_MESSAGE);
        customElements.define("cui-message-list", CUI_MESSAGE_LIST);
        customElements.define('cui-section', SECTION);
        customElements.define('cui-table', TABLE);
        customElements.define('cui-table-col', TABLE_COL);
        customElements.define('cui-table-foot', TABLE_FOOT);
        customElements.define('cui-toast', TOAST);
        customElements.define('cui-toaster', TOASTER);
        customElements.define('cui-tree', TREE);
        customElements.define("cui-tree-branch", TREE_BRANCH);
        customElements.define("cui-tree-leaf", TREE_LEAF);
        customElements.define("cui-tree-filter", TREE_FILTER);

        // customElements.define('cui-spinner', CUI_SPINNER);

        customElements.define('cui-chart-bar', BAR_CHART);
        customElements.define('cui-chart-line', LINE_CHART);

        customElements.define('cui-slide-show', SLIDE_SHOW);
        // customElements.define('slide-show-timer', TIMER);
        customElements.define('cui-slide', SLIDE);
        customElements.define('cui-counter', COUNTER);



        if (window.location.host.indexOf('localhost') === 0) {
            window.APPNAME = "";
        }

        // Slideshow config
        this.oKnownNamespace = {
            "nimbus-rpsacp": {
                "name": "nimbus-rpsacp",
                "key": "rpsacp"
            },
            "nimbus-reftable": {
                "name": 'Reference Tables',
                "key": "reftable"
            },
            "nimbus-rpsonline": {
                "name": "Real Property Online",
                "key": "rpsonline"
            },
            "nimbus-rpspad": {
                "name": "Property Assessment Data",
                "key": "rpspad"
            },
            "nimbus-cris": {
                "name": "nimbus-cris",
                "key": "cris"
            },
            "nimbus-iasra": {
                "name": "nimbus-iasra",
                "key": "iasra"
            },
            "nimbus-hr": {
                "name": "Human Resources",
                "key": "hr"
            },
            "nimbus-rpwtwr": {
                "name": "nimbus-rpwtwr",
                "key": "rpwtwr"
            },
            "nimbus-corresp": {
                "name": "Correspondence",
                "key": "corresp"
            },
            "nimbus-apac": {
                "name": "nimbus-apac",
                "key": "apac"
            },
            "nimbus-exceptions": {
                "name": "Exceptions",
                "key": "exceptions"
            },
            "nimbus-cse": {
                "name": "nimbus-cse",
                "key": "cse"
            },
            "nimbus-onlsvs": {
                "name": "Online Services",
                "key": "onlsvs"
            },
            "nimbus-swop": {
                "name": "nimbus-swop",
                "key": "swop"
            },
            "nimbus-amp": {
                "name": "Audit",
                "key": "amp"
            },
            "nimbus-fwrk": {
                "name": "Framework",
                "key": "fwrk"
            },
            "nimbus-rpmisctax": {
                "name": "nimbus-rpmisctax",
                "key": "rpmisctax"
            },
            "nimbus-acr": {
                "name": "nimbus-acr",
                "key": "acr"
            },
            "nimbus-pitrp": {
                "name": "Personal Income Return Processing",
                "key": "pitrp"
            },
            "nimbus-ti": {
                "name": "Taxpayer Information",
                "key": "ti"
            },
            "nimbus-strp": {
                "name": "nimbus-strp",
                "key": "strp"
            },
            "nimbus-common": {
                "name": "Common Services",
                "key": "common"
            },
            "nimbus-ias": {
                "name": "nimbus-ias",
                "key": "ias"
            },
            "nimbus-empf": {
                "name": "nimbus-empf",
                "key": "empf"
            },
            "nimbus-prms": {
                "name": "Protest & Review Management System",
                "key": "prms"
            }
        };

        // Namespaces we dont want to work with
        this.asSkipableNamespaces = ["nimbus-fwtest", "nimbus-training", "nimbus-dashboards", "nimbus-spaui"];

        this.dRefs = {
            dSlideShow: null
        };

    }

    getOnlineStatus() {
        return this.oOnline.status;
    }

    async init() {
        if (!this.__bInit) {
            let oGlobalContextAppLevel = {
                "globals": "value"
            }

            await super._init(this.oGlobalTemplates, oGlobalContextAppLevel);

            DOM.clearElements(document.body);

            this.dAppBody = document.createElement('div');
            this.dAppBody = DOM.createElement('div', { "id": "app-root" });

            document.body.appendChild(this.dAppBody);

            this._init_AppWrapper();
            this._init_DataInterface();
            this._init_DataStore();

            let sCurrentLocation = this.sLaunchPath.replace(this.sOrigin, '');

            let bContinue = true;


            if (sCurrentLocation && sCurrentLocation.length && sCurrentLocation !== "/") {
                await this.cRouter.navTo(sCurrentLocation);
            }
            else {
                await this.cRouter.navTo("/");
            }

            this.__bInit = true;
            try {

                await this.#bootstrap();
            }
            catch(oError) {

                console.error(oError)
            }

            if (bContinue) {

                let sNewPath = window.location.pathname.slice(1)
    
                if (sNewPath.length) {
    
                    await this.cRouter.navTo(sNewPath);
                }
                else {
    
                    await this.cRouter.navTo("/index");
                }
            }

        }
    }

    getOnlineStatus() {
        return this.oOnline.status;
    }

    async fetch(oProps, oData) {

        let dService = new DATA_INTERFACE_SERVICE_EXTERNAL(oProps, this.getOnlineStatus.bind(this));

        try {

            return dService.request(oData);
        }
        catch (oError) {

            console.log("App error");
            console.log(oError);
        }
    }

    async nameSpaceTotalFunctionRequest(sNamespace, sSort = "desending", sTimeframe = "1h", iLimit = 1000) {

        let oTotalRequestPayload = {
            data: {
                namespace: sNamespace,
                sort: sSort,
                limit: iLimit,
                timeframe: sTimeframe
            }
        };

        let oTotalRequestProps = {
            url: this.getURL('TVSPAUC', "totalFuncReqPerNamespace")
        }

        let oTotalRequestResponse = null;

        try {

            oTotalRequestResponse = await cAPP.fetch(oTotalRequestProps, oTotalRequestPayload)
        }
        catch (oError) {
            console.error(oError);
            return null;
        }

        return oTotalRequestResponse;
    }

    // Request Functions
    // ==============================================

    // Function will request all the known platform namespaces
    async #requestNamespaces() {

        let oRequest = {
            url: this.getURL('TVSPAUC', "getNamespaces")
        };

        let oResponse = null;

        try {

            oResponse = await cAPP.fetch(oRequest)
        }
        catch (oError) {
            console.error(oError);
            //console.error(`Error while requesting first time load data`);
        }

        if (oResponse?.app?.data?.products.length) {

            return oResponse.app.data.products.map((oItem) => {
                return oItem.name;
            })

        }

        return null;
    }

    // Function will retrieve all the average function response time for all functions under a given namsepace
    async #requestNamespaceAvgFuncRespTime(asNamespaces, oOptions) {

        let bSingle = false;

        let oNamespaceAppsRequest = {
            url: this.getURL('TVSPAUC', "avgFuncRespTimePerNamespace"),
        };

        let oNamespaceAppDataPayload = {
            data: {
                "namespace": null,
                "sort": "acending",
                "limit": 1000,
                "timeframe": "1h"
            }
        };

        if (typeof asNamespaces === "string") {

            asNamespaces = [ asNamespaces ];
            bSingle = true;
        }
        else if (Array.isArray(asNamespaces) && asNamespaces.length === 1) {
            bSingle = true;
        }

        let apRequests = [];

        for (let sNamespace of asNamespaces) {
            
            let oNamespacePayload = Object.assign({}, oNamespaceAppDataPayload);
            
            // Merge stuff in
            if (oOptions) {
                oNamespacePayload.data = Object.assign({}, oNamespacePayload.data, oOptions);
            }

            oNamespacePayload.data.namespace = sNamespace;

            apRequests.push( await cAPP.fetch(oNamespaceAppsRequest, oNamespacePayload) )

        }

        let aoResponse = null;

        try {
            aoResponse = await Promise.all(apRequests);
        } catch (error) {
            // Handle any errors that occurred during promise resolution
            console.error("An error occurred:", error);
        }

        if (aoResponse && aoResponse.length) {

            aoResponse = aoResponse.map((oResponse, index) => {

                if (oResponse?.status === "success" && oResponse?.app?.data) {

                    return {
                        requestType: "Average Function Response Time",
                        namespace: asNamespaces[index],
                        response: oResponse.app.data
                    }; 
                
                }
                else {

                    return {
                        requestType: "Average Function Response Time",
                        namespace: asNamespaces[index],
                        response: null
                    };
                }

            })

            if (bSingle) {

                return aoResponse[0];
            }

            return aoResponse;

        }

        return null;
    }

    // Function will retrieve total requests per namespace
    async #requestFunctionTotalRequest(asNamespaces, oOptions) {

        let bSingle = false;

        let oNamespaceAppsRequest = {
            url: this.getURL('TVSPAUC', "totalFuncReqPerNamespace"),
        };

        let oNamespaceAppDataPayload = {
            data: {
                "namespace": null,
                "sort": "descending",
                "limit": 1000,
                "timeframe": "1h"
            }
        };

        if (typeof asNamespaces === "string") {

            asNamespaces = [ asNamespaces ];
            bSingle = true;
        }
        else if (Array.isArray(asNamespaces) && asNamespaces.length === 1) {
            bSingle = true;
        }

        let apRequests = [];

        for (let sNamespace of asNamespaces) {
            
            let oNamespacePayload = Object.assign({}, oNamespaceAppDataPayload);
            
            // Merge stuff in
            if (oOptions) {
                oNamespacePayload.data = Object.assign({}, oNamespacePayload.data, oOptions);
            }

            oNamespacePayload.data.namespace = sNamespace;

            apRequests.push( await cAPP.fetch(oNamespaceAppsRequest, oNamespacePayload) )

        }

        let aoResponse = null;

        try {
            aoResponse = await Promise.all(apRequests);
        } catch (error) {
            // Handle any errors that occurred during promise resolution
            console.error("An error occurred:", error);
        }

        if (aoResponse && aoResponse.length) {

            aoResponse = aoResponse.map((oResponse, index) => {

                if (oResponse?.status === "success" && oResponse?.app?.data) {

                    return {
                        requestType: "Total Function Request Count",
                        namespace: asNamespaces[index],
                        response: oResponse.app.data
                    }; 
                
                }
                else {

                    return {
                        requestType: "Total Function Request Count",
                        namespace: asNamespaces[index],
                        response: null
                    };
                }

            })

            if (bSingle) {

                return aoResponse[0];
            }

            return aoResponse;

        }

        return null;
    }

    async #requestTotalFuncReqPerDay(asNamespaces, oOptions) {

        let bSingle = false;

        let oNamespaceAppsRequest = {
            url: this.getURL('TVSPAUC', "totalFuncReqPerNamespacePerDay"),
        };

        let oNamespaceAppDataPayload = {
            data: {
                "namespace": null,
                "days": "14"
            }
        };

        if (typeof asNamespaces === "string") {

            asNamespaces = [ asNamespaces ];
            bSingle = true;
        }
        else if (Array.isArray(asNamespaces) && asNamespaces.length === 1) {
            bSingle = true;
        }

        let apRequests = [];

        for (let sNamespace of asNamespaces) {
            
            let oNamespacePayload = Object.assign({}, oNamespaceAppDataPayload);
            
            // Merge stuff in
            if (oOptions) {
                oNamespacePayload.data = Object.assign({}, oNamespacePayload.data, oOptions);
            }

            oNamespacePayload.data.namespace = sNamespace;

            apRequests.push( await cAPP.fetch(oNamespaceAppsRequest, oNamespacePayload) )

        }

        let aoResponse = null;

        try {
            aoResponse = await Promise.all(apRequests);
        } catch (error) {
            // Handle any errors that occurred during promise resolution
            console.error("An error occurred:", error);
        }

        if (aoResponse && aoResponse.length) {

            aoResponse = aoResponse.map((oResponse, index) => {

                if (oResponse?.status === "success" && oResponse?.app?.data) {

                    return {
                        requestType: "Total Function Request Per Day",
                        namespace: asNamespaces[index],
                        response: oResponse.app.data
                    }; 
                
                }
                else {

                    return {
                        requestType: "Total Function Request Per Day",
                        namespace: asNamespaces[index],
                        response: null
                    };
                }

            })

            if (bSingle) {

                return aoResponse[0];
            }

            return aoResponse;

        }
    }

    // =====================

    // Request Namespace Data (sNamespace, sKey)
    async #requestNamespaceData(oNamespaceDef) {

        console.log(oNamespaceDef);

        let sNamespace = oNamespaceDef.namespace;

        // Variable to hold promises
        let apNamespaceDataPromise = [];

        // Request all the data we need for this singular namespace
        // =================================================================
        // Average Function Request Response Time - last hour
        // Total Function Requests - last hour
        apNamespaceDataPromise.push(this.#requestNamespaceAvgFuncRespTime(sNamespace));
        apNamespaceDataPromise.push(this.#requestFunctionTotalRequest(sNamespace));
        apNamespaceDataPromise.push(this.#requestTotalFuncReqPerDay(sNamespace));

        let aoNamespaceDataResults = null;

        try {

            aoNamespaceDataResults = await Promise.all(apNamespaceDataPromise);
        }
        catch(oError) {

            console.error(`Error occured when building out namespace info`);
            console.log(oError);
        }

        if (aoNamespaceDataResults) {
    
            let oNamespaceSpec = Object.assign({}, this.#pvt.oNamespaces[sNamespace]);
    
            // Normalize the current data payload.
            if (!oNamespaceSpec.data || (oNamespaceSpec.data && Object.keys(oNamespaceSpec.data).length)) {
                oNamespaceSpec.data = {};
            }
            
            let asAppFunctions = [];

            // Loop through all namespace data
            for (let r = 0, rLen = aoNamespaceDataResults.length; r < rLen; r++) {

                let oDataResults = aoNamespaceDataResults[r];

                if (oDataResults) {

                    switch (oDataResults.requestType) {
    
                        case "Average Function Response Time":
    
                            oNamespaceSpec.data.avgFunctionResponseTime = {
                                aNoRequest: (oDataResults.response.noRequests) ? oDataResults.response.noRequests : [],
                                aoAvgReqTime: (oDataResults.response.oAppRequests) ? oDataResults.response.oAppRequests : []
                            };
    
                            // Get all function names out of no request
                            if (oDataResults.response.noRequests && oDataResults.response.noRequests.length) {
    
                                oDataResults.response.noRequests.forEach((sFunction) => {
    
                                    if (asAppFunctions.indexOf(sFunction) === -1) {
                                        asAppFunctions.push(sFunction);
                                    }
    
                                });
    
                            }
    
                            // Get all function names out of app request.
                            if (oDataResults.response.oAppRequests && oDataResults.response.oAppRequests.length) {
    
                                oDataResults.response.oAppRequests.forEach((oRequest) => {
    
                                    if (asAppFunctions.indexOf(oRequest.topic) === -1) {
                                        asAppFunctions.push(oRequest.topic);
                                    }
    
                                })
    
                            }
    
                            break;
    
                        case "Total Function Request Count":
    
                            oNamespaceSpec.data.totalFunctionRequests = {
                                aNoRequest: [],
                                aoRequestCount: []
                            };

                            for (let oService of oDataResults.response) {

                                if (asAppFunctions.indexOf(oService.metric.function) === -1) {
                                    asAppFunctions.push(oService.metric.function);
                                }

                                let iValue = parseInt(oService.value[1]);

                                if (iValue) {
                                    oNamespaceSpec.data.totalFunctionRequests.aoRequestCount.push({
                                        function: oService.metric.function,
                                        value: iValue
                                    })
                                }
                                else {
                                    oNamespaceSpec.data.totalFunctionRequests.aNoRequest.push(oService.metric.function)
                                }

                            }
    
                            break;

                        case "Total Function Request Per Day":

                            if (oDataResults.response) {

                                // Check to see if there are any requests in the last 14 days
                                let iZeorRequests = 0;
    
                                for (let r = 0, rLen = oDataResults.response.length; r < rLen; r++) {
    
                                    // Add 4 hours to time as it coming back in UTC time
                                    let dDate = new Date(parseInt(oDataResults.response[r].topic) + 14400000);
                                    oDataResults.response[r].topic = dDate.toISOString();

    
                                    if (!oDataResults.response[r].value) {
                                        iZeorRequests += 1;
                                    }
    
                                }
    
                                if (iZeorRequests === oDataResults.response.length) {
    
                                    oNamespaceSpec.data.totalFunctionRequestsPerDay = null;
                                }
                                else {
                                    
                                    oNamespaceSpec.data.totalFunctionRequestsPerDay = [...oDataResults.response];
                                }
                            }
                            else {

                                // Fallback incase a response is not returned
                                oNamespaceSpec.data.totalFunctionRequestsPerDay = null;
                            }
                        
                            break;
    
                        default:
    
                            console.error(`Unknown namespace request payload: ${oDataResults.requestType}`);
                            break;
    
                    }
                }

            }

            // Functions
            oNamespaceSpec.functions = asAppFunctions;

            // Update the namespace with data!
            this.#pvt.oNamespaces[sNamespace] = oNamespaceSpec;
        }

    }

    // Processing Functions
    // ==============================================

    // Function updates the private working namsepace object that drives the slideshow
    #processNamespaces(asNamespaces) {

        const oBaseDefinition = {
            "name": null,
            "key": null,
            "apps": null,
            "functions": null,
            "namespace": null,
            "data": {}
        };

        // Loop all returned namespaces
        for (let sNamespace of asNamespaces) {

            let sEnvironmentlessName = sNamespace.split('-').slice(2).join("-");

            // Skip know skip namespaces
            if (this.asSkipableNamespaces.indexOf(sEnvironmentlessName) === -1) {

                // Check if namespace exists
                if (!this.#pvt.oNamespaces[sEnvironmentlessName]) {
    
                    let oNamespaceDefinition = null;
    
                    if (this.oKnownNamespace[sEnvironmentlessName]) {
    
                        oNamespaceDefinition = Object.assign({}, oBaseDefinition, this.oKnownNamespace[sEnvironmentlessName]);
                    }
                    else {
    
                        console.warn(`Unknown Namespace: ${sEnvironmentlessName}`);
    
                        oNamespaceDefinition = Object.assign({}, oBaseDefinition);
                    }
    
                    
                    // Figure out the product if the key is missing
                    if (oNamespaceDefinition.key === null) {
                        
                        let asNamespaceSplit = sNamespace.split('-');
                        oNamespaceDefinition.key = asNamespaceSplit[asNamespaceSplit.length - 1];
                    }

                    if (oNamespaceDefinition.name === null) {
                        oNamespaceDefinition.name = sEnvironmentlessName;
                    }

                    oNamespaceDefinition.namespace = sNamespace;
    
                    // Save off namespace definition
                    this.#pvt.oNamespaces[sNamespace] = oNamespaceDefinition;
                }

            }

        }

    }

    // Utility Functions
    // ==============================================

    getNamespaces() {

        return Object.keys(this.#pvt.oNamespaces);
    }

    getNamespaceDef(sNamespace) {

        if (sNamespace && sNamespace.length) {

            if (this.#pvt.oNamespaces[sNamespace]) {

                return this.#pvt.oNamespaces[sNamespace];
            }
            else {
            
                console.error(`Unknown namespace requested: ${sNamespace}`);
            }

        }
        else {

            console.error(`Invalid namespace name: ${sNamespace}`);
        }

        return null;
    }

    // Process to bootstrap the data for the slideshow app (happens before first render is complete.)
    async #bootstrap() {

        let asNamespaceResponse = null;

        // Request all namespaces
        try {

            asNamespaceResponse = await this.#requestNamespaces();
        }
        catch(oError) {

            console.error(`Unable to access data!\n${oError.message}`);
        }

        // Continue if namespaces were returned
        if (asNamespaceResponse && asNamespaceResponse.length) {
            
            // Create the namespace definitions
            this.#processNamespaces(asNamespaceResponse);

            for (let sNamespace in this.#pvt.oNamespaces) {

                let oNamespaceDataResponse = null;

                try {

                    oNamespaceDataResponse = await this.#requestNamespaceData(this.#pvt.oNamespaces[sNamespace]);
                }   
                catch(oError) {

                    console.error(`Error requesting initial namespace data for ${sNamespace}`);
                    console.log(oError);
                }

            }

        }

    }

    _init_AppWrapper() {
        this._dAppRoot = document.body;
    }

    _init_DataInterface() {
        this.data_interface = new DATA_INTERFACE();
    }

    _init_DataStore() {
        this._dataStore = new DATA_STORE({
            "state": {
                "title": "Example CUI2"
            }
        });

        this.dsAppData = this._dataStore;
    }
}

(async function () {
    const EXMPL_APP = new APP();
    EXMPL_APP.init();
})();