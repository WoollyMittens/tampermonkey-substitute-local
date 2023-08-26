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

(function () {
	"use strict";

	const removals = [
		{
			target: 'title + link[rel="stylesheet"]',
		}
	];

	const replacements = [
		{
			target: 'title + link[rel="stylesheet"]',
			attribute: "href",
			remote: /css\//,
			local: "http://localhost/PATH/TO/CSS/",
			suffix: "?t={t}",
		}
	];

	const additions = [
		{
			target: "head",
			filename: "styles.css",
			rewrites: [],
			path: "http://localhost/PATH/TO/ASSET/",
			suffix: "?t={t}",
			wrapper: "<style>{w}</style>",
			delay: 0,
		}
	];

	function performRemovals() {
		// perform the removals
		for (let removal of removals) {
			let elements = document.querySelectorAll(removal.target + ",[data-addition]");
			for (let element of elements) {
				element.parentNode.removeChild(element);
			}
		}
	}

	function performReplacements() {
		// perform the replacements
		for (let replacement of replacements) {
			let elements = document.querySelectorAll(replacement.target);
			for (let element of elements) {
				let path = element.getAttribute(replacement.attribute);
				path = path.replace(replacement.remote, replacement.local) + replacement.suffix.replace("{t}", new Date().getTime());
				element.setAttribute(replacement.attribute, path);
			}
		}
	}

	function performAdditions() {
		// perform the additions
		for (let addition of additions) {
			// load the content
			GM_xmlhttpRequest({
				method: "GET",
				url: addition.path + addition.filename + addition.suffix.replace("{t}", new Date().getTime()),
				onload: (evt) => {
					if (evt.status !== 200) {
						console.log("error retrieving file:", evt);
						return null;
					}
					// insert the contents into the document
					setTimeout(() => {
						let insertion = document.querySelector(addition.target);
						let response = evt.responseText || evt.target.responseText;
						let template = document.createElement("template");
                        let wrapper = addition.wrapper || '{w}';
                        let contents = response.replace(/\.\.\//g, addition.path);
						template.innerHTML = wrapper.replace('{w}', contents);
						condemn(template.content);
						insertion.appendChild(template.content);
					}, addition.delay);
				},
			});
		}
	}

	function condemn(content) {
		let elements = content.querySelectorAll("*");
		for (let element of elements) {
			if (element?.setAttribute) element.setAttribute("data-addition", "");
		}
	}

	function update() {
		performRemovals();
		performReplacements();
		performAdditions();
	}

	function refreshkey(evt) {
		if (evt.key === "`" || evt.key === "~") {
			performRemovals();
			performReplacements();
			performAdditions();
		}
	}

	setTimeout(update.bind(this), 500);

	window.addEventListener("keyup", refreshkey.bind(this));
})();
