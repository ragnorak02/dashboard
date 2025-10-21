import MAIN_TEMPLATE from "./main.tpl.html";

export default class EXMPL_MAIN_LAYOUT extends LAYOUT {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "Example Base";
        this.sFooter = "false";

        this.sLayoutTemplate = MAIN_TEMPLATE;
        this.sChildViewContainerSelector = "#app-screen-container";
    }
}