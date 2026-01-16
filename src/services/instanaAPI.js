export async function dataRetrieval(dateToElement, dateFromElement, dataPointsElement) {
    let to = dateToElement.value + 'T00:00:00';
    let from = dateFromElement.value + 'T00:00:00';
    let toDate = new Date(to);
    let fromDate = new Date(from);
    const numOfDataPoints = Number(dataPointsElement.value);

    const timeDiff = toDate.getTime() - fromDate.getTime();

    if (timeDiff < 0 || toDate.getTime() > Date.now()) {
        alert("Error, cannot submit! Either from date is later than to date or to date is in the future.");
    }
    else {
        //Calculates the amount of time for each data point        
        const timeFrameSplits = Math.trunc(timeDiff / numOfDataPoints);

        //Starting toDate at start of time frame + first split
        const toMS = toDate.getTime();
        let splitToMS = toMS - timeDiff;

        //Choosing TagFilterExpression, turning into a string, then encoding it into a URI component
        let tagFilterExpression = {
            "type": "EXPRESSION",
            "logicalOperator": "AND",
            "elements": [
                {
                    "type": "TAG_FILTER",
                    "name": "application.name",
                    "operator": "EQUALS",
                    "entity": "DESTINATION",
                    "value": "WebSphere Production"
                },
                {
                    "type": "TAG_FILTER",
                    "name": "service.name",
                    "operator": "CONTAINS",
                    "entity": "DESTINATION",
                    "value": "E_1"
                }
            ]
        };
        let tagFilterExpressionString = JSON.stringify(tagFilterExpression);
        let encodedTFEString = encodeURIComponent(tagFilterExpressionString);

        let metrics = [];

        for (let i = 0; i < numOfDataPoints; i++) {
            splitToMS += timeFrameSplits;
            let proxyEndpoint = new URL('http://localhost:3000/proxy?t=' + Math.random());

            proxyEndpoint.searchParams.append('toDate', splitToMS);
            proxyEndpoint.searchParams.append('timeFrame', timeFrameSplits);
            proxyEndpoint.searchParams.append('filterData', encodedTFEString);

            console.log(`\u001b[1;34m ${proxyEndpoint}`);

            try {
                let response = await fetch(proxyEndpoint, {
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    throw new Error('Network response from proxy server was not ok');
                }

                let data = await response.json();
                let metricsResult = await aggregateMetrics(data);
                metrics.push(metricsResult);
            }
            catch (error) {
                console.error('Error fetching data:', error.message);
            }
            finally {
                proxyEndpoint.searchParams.delete('toDate');
                proxyEndpoint.searchParams.delete('timeFrame');
                proxyEndpoint.searchParams.delete('filterData');
                await sleep(250);
            }
        }
        return metrics;
    }
}

//Used to separate API calls for limiting
async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, ms);
    });
}

//Combines the metrics of all services to find the aggregate metrics
//Returns metric array of length = 5; 0 = calls, 1 = avg. errors, 2 = avg. latency, 3 = from time, 4 = to time
async function aggregateMetrics(data) {
    let services = data.items;
    let calls = 0;
    let errors = 0;
    let latency = 0;

    if (services.length === 0) {
        console.log("No results returned");
    }
    else {
        let dateOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };

        let from = new Date(data.adjustedTimeframe['to'] - data.adjustedTimeframe['windowSize']).toLocaleDateString('en-US', dateOptions);
        let to = new Date(data.adjustedTimeframe['to']).toLocaleDateString('en-US', dateOptions);
        console.log(`\u001b[1;34m Data Acquired`);
        for (const current of services) {
            calls += Number(current.metrics['calls.sum'][0][1]);
            errors += Number(current.metrics['errors.mean'][0][1]);
            latency += Number(current.metrics['latency.mean'][0][1]);
        }

        let avgErrors = errors / services.length;
        let avgLatency = latency / services.length;

        return [calls, avgErrors, avgLatency, from, to];
    }
}