import SCREEN_TEMPLATE from './dashboardScreen.tpl.html';
import SCREEN_STYLES from './dashboardScreen.scss';

export default class DASHBOARDSCREEN extends SCREEN {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "Dashboard Screen";        

        this.oScreenCriteria = {
            "resourceId": "index",
            "renderModes": {
                "default": {
                    "layouts": []
                }
            }
        }    
        
        
        this.sScreenTemplate = SCREEN_TEMPLATE;
        this.sScreenStyles = SCREEN_STYLES;

    }     
}
        // example usage
        let testMess = window.TextIncludes.getTestMessage();

        console.log("test message2: " +  testMess);