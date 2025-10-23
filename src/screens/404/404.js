import SCREEN_TEMPLATE from './404.tpl.html';

export default class APPLICATION_404 extends SCREEN {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "Screen Not Found";
        
        this.sScreenTemplate = SCREEN_TEMPLATE;

        this.oScreenCriteria = {
            "resourceId": "404",
            "renderModes": {
                "default": {
                    "layouts": []
                }
            }
        }
    }
}