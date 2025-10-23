import MAIN_TEMPLATE from "./main.tpl.html";

export default class TAX_VISION_MAIN_LAYOUT extends LAYOUT {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "TAX VISION Base";
        this.sMessageListSelector = '#screen-messages';
        this.sFooter = "false";

        this.sLayoutTemplate = MAIN_TEMPLATE;
        this.sChildViewContainerSelector = "#app-screen-container";
        
    }
}