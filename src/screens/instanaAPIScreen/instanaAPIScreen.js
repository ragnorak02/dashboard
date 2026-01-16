import SCREEN_TEMPLATE from './instanaAPIScreen.tpl.html';
import SCREEN_STYLES from './instanaAPIScreen.scss';
import { dataRetrieval } from '../../services/instanaAPI.js';


export default class MONITORSCREEN extends SCREEN {
    constructor(oProps) {
        super(oProps);
        this.sTitle = "Instana API Test Screen";
        this.sMessageListSelector = '#screen-messages';
        this.oScreenCriteria = {
            "resourceId": "index",
            "renderModes": {
                "default": {
                    "layouts": []
                }
            }
        };
        this.sScreenTemplate = SCREEN_TEMPLATE;
        this.sScreenStyles = SCREEN_STYLES;

        // Layout state management
        //this.currentLayout = null; // Will be initialized from DOM
        //this.pendingLayout = null;
    }

    _postRender() {
        super._postRender();
        this.initPage();
    }

    initPage() {
        const dateToInput = document.getElementById('date-to');
        const dateFromInput = document.getElementById('date-from');
        const dataPoints = document.getElementById('data-points');
        const submitButton = document.getElementById('submit-button');
        const contentArea = document.getElementById('myDiv');

        let today = new Date(Date.now());
        let todayString = today.toISOString().slice(0, 10);
        dateToInput.value = todayString;
        dateToInput.max = todayString;

        today.setDate(today.getDate() - 7);
        let fromDayString = today.toISOString().slice(0, 10);
        dateFromInput.value = fromDayString;
        today.setDate(today.getDate() + 6);
        todayString = today.toISOString().slice(0, 10);
        dateFromInput.max = todayString;

        dateToInput.addEventListener('change', () => {
            const pattern = /\d{4}-\d{2}-\d{2}/;
            if (pattern.test(dateToInput.value)) {
                let maxDateTime = new Date(dateToInput.value);
                maxDateTime.setDate(maxDateTime.getDate() - 1);

                const formattedMaxDateTime = maxDateTime.toISOString().slice(0, 10);

                if (dateFromInput.value > dateToInput.value) {
                    dateFromInput.value = formattedMaxDateTime;
                }
                dateFromInput.max = formattedMaxDateTime;
            }
        });

        //Adds data to a hidden content area
        async function displayMetrics(contents) {
            if (contentArea) {
                if (contents) {
                    contents.forEach((metrics) => {
                        if (metrics) {
                            contentArea.innerHTML += `
                            <h2> Date Range: ${metrics[3]} - ${metrics[4]}</h2>
                            <p>Total number of calls: ${metrics[0]}</p>
                            <p>Average number of errors: ${metrics[1].toFixed(4)}</p>
                            <p>Average amount of latency: ${Math.trunc(metrics[2])} ms</p>
                            `;
                            console.log('Metric added');
                        }
                    });
                }
            }
        }

        submitButton.addEventListener('click', async () => {
            const loadingIndicator = document.getElementById('loader');
            const loadingContainer = document.getElementById('loader-container');

            loadingContainer.style.display = 'flex';
            loadingIndicator.style.display = 'block';

            contentArea.style.display = 'none';
            contentArea.innerHTML = '';

            let promise = dataRetrieval(dateToInput, dateFromInput, dataPoints);
            const results = await promise;
            displayMetrics(results);

            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
                loadingContainer.style.display = 'none';
            }
            contentArea.style.display = 'block';
        });
    }
}