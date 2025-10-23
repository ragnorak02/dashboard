import PAGE_INFO_STYLES from './pageinfo.scss';
import PAGE_INFO_TEMPLATE from './pageinfo.tpl.html';

export default class PAGE_INFO extends HTMLElement {

    constructor() {

        super();

        this.attachShadow({mode: 'open'});
        
        this.state = null;

        // Key Shadow DOM fields
        this.sdMetaContainer = null;
        this.sdPageTitle = null;
        this.sdPageUpdateInfo = null;
        this.sdLastUpdatedBy = null;
        this.sdLastUpdatedByContainer = null;
        this.sdLastUpdatedDate = null;
        this.sdLastUpdatedDateContainer = null;
        this.sdPageControls = null;
        this.sdPageNotes = null;
        this.sdPageHelp = null;
    }

    get style() {
        return `<style>${PAGE_INFO_STYLES}</style>`;
    }

    get template() {
        return `${PAGE_INFO_TEMPLATE}`;
    }

    connectedCallback() {

        this.state = {
            sTitle: this.getAttribute('title') || "PAGE TITLE NEEDS TO BE SET",
            sLastUpdated: this.getAttribute('lastupdated') || "",
            sLastUpdatedBy: this.getAttribute('lastupdatedby')  || "",
            bHideUpdate: (this.getAttribute('hideUpdateInfo') && this.getAttribute('hideUpdateInfo') === "true") ? true : false,
            bHidePageControls: (this.getAttribute('hidePageControls')) ? true : false,
            bHideNotes: (this.getAttribute('hideNotes')) ? true : false,
            bHideHelp: (this.getAttribute('hideHelp')) ? true : false
        }

        this.render();

    }

    render() {

        this.shadowRoot.innerHTML = `${this.style}${this.template}`;

        this.sdMetaContainer = this.shadowRoot.querySelector(`#page-info-meta`);
        this.sdPageTitle = this.shadowRoot.querySelector(`#page-title`);
        this.sdPageUpdateInfo = this.shadowRoot.querySelector(`#page-update-info`);
        this.sdLastUpdatedBy = this.shadowRoot.querySelector(`#page-last-updated-by`);
        this.sdLastUpdatedByContainer = this.shadowRoot.querySelector(`#page-last-updated-by-container`);
        this.sdLastUpdatedDate = this.shadowRoot.querySelector(`#page-last-updated-date`);
        this.sdLastUpdatedDateContainer = this.shadowRoot.querySelector(`#page-last-updated-date-container`);
        this.sdPageControls = this.shadowRoot.querySelector(`#page-info-controls`);
        this.sdPageNotes = this.shadowRoot.querySelector(`#page-note`);
        this.sdPageHelp = this.shadowRoot.querySelector(`#page-help`); 

        // Hide Last Update/Updated By section
        if (this.state.bHideUpdate === true) {

            this.sdMetaContainer.removeChild(this.sdPageUpdateInfo);
            this.sdPageUpdateInfo = null;
        }

        // Hide controls if needed
        if (this.state.bHidePageControls) {

            this.sdMetaContainer.removeChild(this.sdPageControls);
            this.sdPageControls = null;
        }

        this.sdPageTitle.appendChild(document.createTextNode(this.state.sTitle));
    }

}