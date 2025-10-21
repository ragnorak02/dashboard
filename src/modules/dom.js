export function clearElements(dElem) {
    while(dElem.firstElementChild) {
        dElem.removeChild(dElem.firstElementChild);
    }
}

export function createElement(sTag, oAttributes, sTextContent) {
    let dNewElem = document.createElement(sTag);

    if(oAttributes && Object.keys(oAttributes).length) {
        for(let sAttributeName in oAttributes) {
            dNewElem.setAttribute(sAttributeName, oAttributes[sAttributeName]);
        }
    }

    if(sTextContent && sTextContent.length) {
        dNewElem.appendChild(document.createTextNode(sTextContent));
    }

    return dNewElem;
}