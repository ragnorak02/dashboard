import SCREEN_TEMPLATE from './dashboardScreen.tpl.html';
import SCREEN_STYLES from './dashboardScreen.scss';

// Register the <instana-chart> custom element
import 'src/components/instanaChart/instanaChart.js';
 
// Adapter that turns Instana JSON into chart series
import { toChartData } from 'src/services/instana.js';

export default class DASHBOARDSCREEN extends SCREEN {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "Dashboard Screen";  
        this.sMessageListSelector = '#screen-messages';      

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

        