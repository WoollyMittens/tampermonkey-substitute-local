// ==UserScript==
// @name         Local Substitution
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Substitutes assets on remote servers with local versions
// @author       Maurice van Creij
// @match        https://*domain.tld/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {

    'use strict';

    const removals = [{
        target: 'link[rel="stylesheet"]',
    }];

    const replacements = [{
        target: 'link[rel="stylesheet"]',
        attribute: 'href',
        remote: /css\//,
        local: 'http://localhost/PATH/TO/CSS/'
    }];

    const additions = [{
        target: 'head',
        tag: 'style',
        attribute: 'innerhtml',
        value: 'styles.css',
        path: 'http://localhost/PATH/TO/ASSET/'
    }];

    function performRemovals() {
        // perform the removals
        for(let removal of removals) {
            let elements = document.querySelectorAll(removal.target + ',[data-addition]');
            for(let element of elements) {
                element.parentNode.removeChild(element);
            }
        }
    }

    function performReplacements() {
        // perform the replacements
        for(let replacement of replacements) {
            let elements = document.querySelectorAll(replacement.target);
            for(let element of elements) {
                let path = element.getAttribute(replacement.attribute);
                path = path.replace(replacement.remote, replacement.local);
                element.setAttribute(replacement.attribute, path);
            }
        }
    }

    function performAdditions() {
        // perform the additions
        for(let addition of additions) {

			// use an existing element
			let insertion = document.querySelector(addition.target);

			// or create a new one
			if (addition.tag) {
				let element = document.createElement(addition.tag);
                element.setAttribute('data-addition', '');
				insertion.appendChild(element);
                insertion = element;
			}

			// load the content
            switch(addition.attribute) {
                case 'innerhtml':
                    GM_xmlhttpRequest({
                      method: 'GET',
                      url: addition.path + addition.value,
                      onload: (evt) => {
                        if (evt.status !== 200) { console.log('error retrieving file:', evt); return null; };
                        let contents = evt.responseText || evt.target.responseText;
                        insertion.innerHTML = contents.replace(/\.\.\//g, addition.path);
                      }
                    });
                    break;
                default:
					insertion.setAttribute(addition.attribute, addition.path + addition.value);
            }

        }
    }

    function update() {
        performRemovals();
        performReplacements();
        performAdditions();
    }

    function refreshkey(evt) {
        if (evt.key === '`' || evt.key === '~') {
            performRemovals();
            performReplacements();
            performAdditions();
        }
    }

    setTimeout(update.bind(this), 500);

    window.addEventListener('keyup', refreshkey.bind(this));

})();