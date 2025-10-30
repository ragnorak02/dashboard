// Make the connection with the other files in this folder by importing them
// The build process combines this file with the imported files and converts them into one js file

import SCREEN_TEMPLATE from './newsScreen.tpl.html';
import SCREEN_STYLES from './newsScreen.scss';

//this news screen class inherits the CUI screen features. 
/*IMPORTANT***    you can find this class in this run-time built directory node_modules/cui-spa-app-class/modules/screen.js  */
export default class NEWSSCREEN extends SCREEN {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "News Screen";        
        this.sMessageListSelector = '#screen-messages';
        this.oScreenCriteria = {
            "resourceId": "index",
            "renderModes": {
                "default": {
                    "layouts": []
                }
            }
        }    
        
        //pass the imported data to this news screen class
        this.sScreenTemplate = SCREEN_TEMPLATE;
        this.sScreenStyles = SCREEN_STYLES;

    }     
}
        // this is added to fix a run-time error - no region specified for messages...
        //let testMess = window.TextIncludes.getTestMessage();

        //console.log("test message2: " +  testMess);