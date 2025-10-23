import SCREEN_TEMPLATE from './index.tpl.html';
import SCREEN_STYLE from './index.scss';

export default class INDEX extends SCREEN {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "Index";

        this.oScreenCriteria = {
            "resourceId": "index",
            "renderModes": {
                "default": {
                    "layouts": []
                }
            }
        }

        this.sScreenTemplate = SCREEN_TEMPLATE;
        this.sScreenStyle = SCREEN_STYLE;
    }   

    async init(oNavState) {

    }

    async preRender(oNavState, oScreenServiceResponse) {

    }

    async render(oNavState, oScreenServiceResponse, dScreenTemplate) {

    }

    async postRender(oNavState, oScreenServiceResponse, dScreen) {
        
    }
}