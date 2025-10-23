// 1.
// This is the main file. 

// Create a new page in src/screens/newPage/
// page is comprised of 4 file types, .js, .scss, .tpl.html, and .jsonc
// copy an existing .jsonc file into the new screens folder
// use newsScreen as an example

// How to navigate to a page. do a search for 2.

// Create a UI component
// create a folder in src/components/
// create a .js, .scss, and a tpl.html file that all merge into one .js file at build time.
// import that component in this file, see bigNumber for a reference


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

//Components need to be imported. The collection of .js, .tpl.html, and .scss files get merged into one .js file and then merged into spa.js
import PAGE_INFO from './components/pageinfo/pageinfo.js';
import BIG_NUMBER from './components/bigNumber/bigNumber.js';

//This APP class inherits the CUI_APP features
class APP extends CUI_APP {
    constructor() {
        super('script#spa');

        this.oOnline = {
            "status": true
        };

        //displaly the current varibles and values of this APP class
        console.log("print this");

        /*function getTestMessageFromIncludes() {
        return window.TextIncludes.getTestMessage();
        }*/

        // example usage
        let testMess = window.TextIncludes.getTestMessage();

        this.viewKeys = VIEW_KEYS;
        this.helpKeys = HELP_KEYS;

        //3. 
        // need to redo this part. Throw the app layout selection into the individual screen.js files, for exmaple newsScreen.js
        this.sAppLayout = "main";
        this.sApp404Screen = "404";

        //define custom elements based on imports
        //customElements.define('[tag name in html]', [imported class name]);
        // I do not think we need all of these, I am not certain of the weight.
        //ideally we would use these if applicable
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

        //these are the components found in src/components/
        // create widgets to 
        customElements.define('exmpl-pageinfo', PAGE_INFO);
        customElements.define('big-number', BIG_NUMBER);

        if(window.location.host.indexOf('localhost') === 0) {
            window.APPNAME = "";
        }
    }

    //1. complete
    //start app
    async init() {
        if(!this.__bInit) {
            let oGlobalContextAppLevel = {
                "globals": "value"
            }

            await super._init(this.oGlobalTemplates, oGlobalContextAppLevel);

            DOM.clearElements(document.body);

            this.dAppBody = DOM.createElement('div', {"id": "app-root"});

            document.body.appendChild(this.dAppBody);

            this._init_AppWrapper();
            this._init_DataInterface();
            this._init_DataStore();

            let sCurrentLocation = this.sLaunchPath.replace(this.sOrigin, '');

            if(sCurrentLocation && sCurrentLocation.length && sCurrentLocation !== "/") {
                await this.cRouter.navTo(sCurrentLocation);
            }
            else {
                await this.cRouter.navTo("/");
            }

            // 2. complete
            // navigate to this page
            // available screens are located in the /screens
            this.cRouter.navTo('newsScreen');
            this.__bInit = true;
        }
    }

    //required status property
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

    _init_AppWrapper() {
        this._dAppRoot = document.body;
    }

    _init_DataInterface() {
        this.data_interface = new DATA_INTERFACE();
    }

    _init_DataStore() {
        this._dataStore = new DATA_STORE({
            "state": {
                "title": "Tax Vision"
            }
        });

        this.dsAppData = this._dataStore;
    }
}

(async function () {
    const TAX_VISION_APP = new APP();
    TAX_VISION_APP.init();
})();