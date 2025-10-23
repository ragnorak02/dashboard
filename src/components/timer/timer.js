import TIMER_STYLES from './timer.scss';
import TIMER_TEMPLATE from './timer.tpl.html';


export default class TIMER extends HTMLElement {

    constructor() {

        super();
        this._connected = false;
        this.attachShadow({ mode: 'open' });

        this._state = null;
        this.sdPageTitle = null;

        this.nTimeLeft = null;
        this.refreshTIme = 10000;
        this.nValue = null;
        // this.time = null;
        // this.nPercentPerSecond = null;
        this.progressBarInterval = null;
        this.aoSlides = null;
        // this.progressBarIntervalReset = null;

        this.nIncrementValue = null;
        this.nSlideDuration = null;
        this.nMaxDuration = null;
        this.nDefaultTime = 10000;
        this.nSlideIndex = 0;

        this.oPropsToStateNames = {
            "stop": "sStop",
            "start": "sStart",
            "pause": "sPause"
        }

    }

    get style() {
        return `<style>${TIMER_STYLES}</style>`;
    }

    get template() {
        return `${TIMER_TEMPLATE}`;
    }
    get state() {
        let updatedState = {};
        for (let [key, value] of Object.entries(this.oPropsToStateNames)) {

            if (this._state[this.oPropsToStateNames[key]]) {
                updatedState[key] = this._state[this.oPropsToStateNames[key]];
            }
        }

        return updatedState
    }

    setState(props) {
        this._state = Object.assign(this._state, this.normalizeProps(props));

        if (this._connected) {
            this.render();
        }
    }

    normalizeProps(props) {
        let updatedProps = {};
        for (let [key, value] of Object.entries(props)) {
            if (this.oPropsToStateNames[key]) {
                updatedProps[this.oPropsToStateNames[key]] = value;
            }
        }
        return updatedProps;
    }
    populateStateFromAttributes() {
        this._state.sStop = (this.getAttribute('stop')) ? this.getAttribute('stop') : "";
        this._state.sStart = (this.getAttribute('start')) ? this.getAttribute('start') : "";
        this._state.sPause = (this.getAttribute('pause')) ? this.getAttribute('pause') : "";
    }
    connectedCallback() {

        this._connected = true;
        // this.populateStateFromAttributes();

        this.render();

        // this.refreshTimer();
    }

    render() {

        this.shadowRoot.innerHTML = `${this.style}${this.template}`;
        // this.bindKeyEvents(this.nSlideIndex);
    }

    progressBarOG() {
        this.aoSlides = document.querySelectorAll("cui-slide");

        if (this.nSlideIndex == this.aoSlides.length) {
            this.nSlideIndex = 0;
        }

        // console.log(this.nSlideIndex, 'index beginning progress bar function');
        let oActiveSlide = this.aoSlides[this.nSlideIndex];
        // console.log( oActiveSlide, 'the slide that shold be showing')

        this.nSlideDuration = Number(oActiveSlide.getAttribute('duration'));
        this.nMaxDuration = Number(oActiveSlide.getAttribute('duration'));

        //the frequency of how often the interval runs
        this.nIncrementValue = this.nSlideDuration * .001;

        // console.log(this.nSlideDuration, this.nIncrementValue, 'outside of interval');

        //how much time is left before slide change, when 25% of time is left
        this.nTimeLeft = this.nSlideDuration * .25;




        this.progressBarInterval = setInterval(() => {

            let dProgressBar = this.shadowRoot.querySelector('progress');
            dProgressBar.setAttribute('max', this.nMaxDuration);
            this.nValue = this.nSlideDuration -= this.nIncrementValue;
            dProgressBar.setAttribute('value', this.nValue);


            if (Number(dProgressBar.getAttribute('value')) < 10) {
                clearInterval(this.progressBarInterval);
                this.nIncrementValue = null;
                this.nSlideIndex++;
                if (this.nSlideIndex == this.aoSlides.length) {
                    this.nSlideIndex = 0;
                }
                this.progressBar(this.nSlideIndex);
                // console.log(this.nSlideIndex)
            }


            if (this.nSlideDuration == this.nTimeLeft) {

                this.timeLeftEvent();

            }

            //this is the end of the interval
            if (this.nSlideDuration === 0) {
                // console.log('the absolute end of timer')
                let oActiveSlide = document.querySelector('#active');

                //runs when screen is blank
                if (this.nSlideIndex == 0 && oActiveSlide) {
                    // console.log('hello', this.nSlideIndex);

                }


                if (Number(this.nSlideIndex + 1) === Number(this.aoSlides.length)) {
                    let nNextDuration = Number(this.aoSlides[0].getAttribute('duration'));
                    let nCurrentDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
                    // console.log('need to get 1st duration')
                    if (nCurrentDuration !== nNextDuration) {
                        // console.log(this.nSlideIndex, 'hola')
                        clearInterval(this.progressBarInterval);

                        this.nSlideIndex = 0;
                        this.progressBar(this.nSlideIndex);
                    }

                    //original time needs to change to new slide time
                    this.nSlideDuration = nNextDuration;
                    this.nIncrementValue = nNextDuration * .001;

                    if (this.nSlideIndex == this.aoSlides.length) {
                        this.nSlideIndex = 0
                    }

                } else {

                    let nNextDuration = Number(this.aoSlides[this.nSlideIndex + 1].getAttribute('duration'));
                    let nCurrentDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));

                    if (nCurrentDuration !== nNextDuration) {
                        // console.log('current duration and next duration !==')
                        clearInterval(this.progressBarInterval);
                        this.progressBar(this.nSlideIndex);

                    }

                    this.nSlideDuration = nNextDuration;
                    this.nIncrementValue = nNextDuration * .001;

                    if (this.nSlideIndex == this.aoSlides.length) {
                        // console.log('the end');
                        this.nSlideIndex = 0
                    }

                }



            }


        }, this.nIncrementValue);

    }
    start() {
        console.log('start progress bar')
        this.progressBar();
        this.progressBarKeyListeners();
    }
    progressBar() {
        this.aoSlides = document.querySelectorAll("cui-slide");

        if (this.nSlideIndex == this.aoSlides.length) {
            this.nSlideIndex = 0;
        }

        // console.log(this.nSlideIndex, 'index beginning progress bar function');
        // let oActiveSlide = this.aoSlides[this.nSlideIndex];

        let initialProgressValue = 0;

        try {
            let oActiveSlide = document.querySelector('.active');
            //  console.log(oActiveSlide, 'the slide that shold be showing')
            this.nSlideDuration = Number(oActiveSlide.getAttribute('duration'));
            this.nMaxDuration = Number(oActiveSlide.getAttribute('duration'));
        } catch (error) {
            this.nSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
            this.nMaxDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
        }



        //the frequency of how often the interval runs
        this.nIncrementValue = this.nSlideDuration * .001;

        //how much time is left before slide change, when 25% of time is left
        this.nTimeLeft = this.nSlideDuration * .25;

        this.progressBarInterval = setInterval(() => {

            let dProgressBar = this.shadowRoot.querySelector('progress');
            dProgressBar.setAttribute('max', this.nMaxDuration);
            this.nValue = initialProgressValue += this.nIncrementValue;
            dProgressBar.setAttribute('value', this.nValue);

            if (Number(dProgressBar.getAttribute('value')) > [this.nSlideDuration - 10]) {
                clearInterval(this.progressBarInterval);
                this.nIncrementValue = null;
                this.nSlideIndex++;
                if (this.nSlideIndex == this.aoSlides.length) {
                    this.nSlideIndex = 0;
                }
                this.progressBar(this.nSlideIndex);
                // console.log(this.nSlideIndex)
            }


            if (this.nSlideDuration == this.nTimeLeft) {

                this.timeLeftEvent();

            }

            //this is the end of the interval
            if (this.nSlideDuration === 0) {

                let nCurrentDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));

                if (Number(this.nSlideIndex + 1) === Number(this.aoSlides.length)) {
                    let nNextDuration = Number(this.aoSlides[0].getAttribute('duration'));

                    // console.log('need to get 1st duration')
                    if (nCurrentDuration !== nNextDuration) {
                        // console.log(this.nSlideIndex, 'hola')
                        clearInterval(this.progressBarInterval);

                        this.nSlideIndex = 0;
                        this.progressBar(this.nSlideIndex);
                    }

                    //original time needs to change to new slide time
                    this.nSlideDuration = nNextDuration;
                    this.nIncrementValue = nNextDuration * .001;

                    if (this.nSlideIndex == this.aoSlides.length) {
                        this.nSlideIndex = 0
                    }

                } else {

                    let nNextDuration = Number(this.aoSlides[this.nSlideIndex + 1].getAttribute('duration'));

                    if (nCurrentDuration !== nNextDuration) {
                        // console.log('current duration and next duration !==')
                        clearInterval(this.progressBarInterval);
                        this.progressBar(this.nSlideIndex);

                    }

                    this.nSlideDuration = nNextDuration;
                    this.nIncrementValue = nNextDuration * .001;




                    if (this.nSlideIndex == this.aoSlides.length) {
                        // console.log('the end');
                        this.nSlideIndex = 0
                    }

                }

            }


        }, this.nIncrementValue);

    }

    restartInterval() {
        this.nSlideIndex++;
        console.log(this.nSlideIndex, 'within restart function');
        clearInterval(this.progressBarInterval);
        if (this.nSlideIndex == this.aoSlides.length) {
            this.nSlideIndex = 0
        }
        this.progressBar();
    }

    progressBarKeyListeners() {

        let isPaused = false;
        document.addEventListener('keydown', evt => {

            let oActiveSlide = document.querySelector('.active');
            let activeDuration = Number(oActiveSlide.getAttribute('duration'));
            let dProgressBar = this.shadowRoot.querySelector('progress');
            // this.resetValues();

            if (evt.key == "ArrowLeft") {

                clearTimeout(this.progressTimeout);
                clearInterval(this.progressBarInterval);
                isPaused = true;
                let keyCount = 0;

                if (this.nSlideIndex == 0) {

                    this.toggleLastSlideDuration();
                    this.nSlideIndex = this.aoSlides.length - 1;
                    // console.log(this.nSlideIndex, 'from keys');
                    keyCount = 0;
                }

                else {
                    this.togglePreviousSlideDuration(this.nSlideIndex);
                    this.nSlideIndex = this.nSlideIndex - 1;

                }
                dProgressBar.setAttribute('value', activeDuration);
                return this.nSlideIndex;

                // console.log(this.nSlideIndex, 'previous')
            } else if (evt.key == "ArrowRight") {

                clearTimeout(this.progressTimeout);
                clearInterval(this.progressBarInterval);
                this.toggleNextSlideDuration(this.nSlideIndex);
                isPaused = true;
                dProgressBar.setAttribute('value', activeDuration);
                dProgressBar.setAttribute('max', activeDuration);
                return this.nSlideIndex;

            } else if (evt.key == "End") {

                clearTimeout(this.progressTimeout);
                clearInterval(this.progressBarInterval);
                this.nSlideIndex = this.aoSlides.length - 1;
                isPaused = true;
                dProgressBar.setAttribute('value', activeDuration);
                return this.nSlideIndex;

            } else if (evt.key == "Home") {

                clearTimeout(this.progressTimeout);
                clearInterval(this.progressBarInterval);
                this.nSlideIndex = 0;
                // this.toggleFirstSlideDuration(this.nSlideIndex);
                console.log(this.nSlideIndex, 'home')
                isPaused = true;
                let firstSlide = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
                // // console.log(firstSlide)
                dProgressBar.setAttribute('value', firstSlide);
                return this.nSlideIndex;
            }
            if (evt.key == " ") {

                if (isPaused == false) {

                    clearTimeout(this.progressTimeout);
                    clearInterval(this.progressBarInterval);

                    isPaused = true;

                    dProgressBar.setAttribute('value', activeDuration);
                    return this.nSlideIndex;
                }
                else {
                    clearTimeout(this.progressTimeout);
                    clearInterval(this.progressBarInterval);
                    if (activeDuration !== this.nIncrementValue) {

                        // console.log("changing")
                        this.nSlideDuration = activeDuration;
                        this.nIncrementValue = activeDuration * .001;

                    }
                    this.progressBar(this.nSlideIndex);
                    isPaused = false;

                    return this.nSlideIndex;
                }
            }
        });
    }
    resetValues() {
        this.nMaxDuration = null;
        this.nIncrementValue = null;
        this.nSlideDuration = null;
    }

    timeLeftEvent() {
        const timeLeftEvent = new CustomEvent("time-left", {
            detail: { message: `time remaining ${this.nTimeLeft * .001} seconds` },
            bubbles: true,
            cancelable: true
        });
        let timeInSeconds = this.nTimeLeft * .001;
        // console.log(timeInSeconds, 'seconds left before next slide');
        this.dispatchEvent(timeLeftEvent);
    }

    togglePreviousSlideDuration() {

        let dProgressBar = this.shadowRoot.querySelector('progress');
        let nPreviousSlideDuration;

        try {
            nPreviousSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
            dProgressBar.setAttribute('value', nPreviousSlideDuration);
            dProgressBar.setAttribute('max', Number(this.aoSlides[this.nSlideIndex - 1].getAttribute('duration')));
            // console.log(previousSlideDuration, 'previous boo')

        } catch (error) {
            this.toggleLastSlideDuration(this.nSlideIndex);
            console.log(previousSlideDuration, 'previous in error')
            this.nSlideIndex = this.aoSlides.length;
            nPreviousSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
            dProgressBar.setAttribute('value', nPreviousSlideDuration);
            dProgressBar.setAttribute('max', Number(this.aoSlides[this.nSlideIndex - 1].getAttribute('duration')));

        }

        return this.nSlideIndex;
    }
    toggleNextSlideDuration() {
        this.nSlideIndex++;
        let dProgressBar = this.shadowRoot.querySelector('progress');
        let nextSlideDuration;

        try {
            nextSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
            dProgressBar.setAttribute('value', nextSlideDuration);
            dProgressBar.setAttribute('max', Number(this.aoSlides[this.nSlideIndex].getAttribute('duration')));
            this.nSlideDuration = nextSlideDuration;
            // console.log(this.nSlideIndex, nextSlideDuration, this.nSlideDuration, 'from within next');
        } catch (error) {
            this.toggleFirstSlideDuration(this.nSlideIndex);
            this.nSlideIndex = 0;
            nextSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
            dProgressBar.setAttribute('value', nextSlideDuration);
            dProgressBar.setAttribute('max', Number(this.aoSlides[this.nSlideIndex].getAttribute('duration')));
            // console.log(this.nSlideIndex, 'from within next error');
            return this.nSlideIndex;
        }
        return this.nSlideIndex;
    }

    toggleLastSlideDuration() {
        this.nSlideIndex = this.aoSlides.length - 1;
        this.nSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
        this.nMaxDuration = this.nSlideDuration;
        // console.log(this.nSlideIndex);
        return this.nSlideIndex;
    }

    toggleFirstSlideDuration() {
        this.nSlideIndex = 0;
        this.nSlideDuration = Number(this.aoSlides[this.nSlideIndex].getAttribute('duration'));
        this.nMaxDuration = this.nSlideDuration;
        return this.nSlideIndex;
    }

}
