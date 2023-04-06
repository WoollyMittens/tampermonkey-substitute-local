# Cross-domain live updates.

This TamperMonkey script substitutes the assets of a remotely hosted site for local versions.

## 1. Install TamperMonkey extention in your browser

Available [TamperMonkey](https://www.tampermonkey.net/) extentions:
- [For Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [For Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
- [For Microsoft Edge](https://www.microsoft.com/en-us/p/tampermonkey/9nblggh5162s?activetab=pivot:overviewtab)
- [For Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089?mt=12)

## 2. Configure the script

Download the example "[tampermonkey.js](https://raw.githubusercontent.com/WoollyMittens/tampermonkey-substitute-local/master/tampermonkey.js)" script from [this repository](https://github.com/WoollyMittens/tampermonkey-substitute-local).

### Fill in the project information

In the top of the file edit the @name of your project and @match the domain of the site the script should affect.

```javascript
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
```

In this case the following domain would be affected: www.domain.tld

### Configure the assets to remove

```javascript
const removals = [{
  target: 'link[rel="stylesheet"]',
}];
```

**target**: All elements that match this selector will be removed.

### Confgure the assets to replace

```javascript
const replacements = [{
  target: 'link[rel="stylesheet"]',
  attribute: 'href',
  remote: /css\//,
  local: 'http://localhost/PATH/TO/CSS/',
	suffix: "?t={t}"
}];
```

- **target**: A element that matches this selector will be replaced.
- **attrbute**: The attribute of the element to be updated.
- **remote**: A regular expression or string representing the asset's path to replace.
- **local**: The URL to a local version of this asset.
- **suffix**: Add a cache buster suffix to the path.

### Configure the assets to add

```javascript
const additions = [{
  target: 'head',
  filename: 'styles.css',
  path: 'http://localhost/PATH/TO/ASSET/',
  suffix: "?t={t}",
  wrapper: "<style>{w}</style>",
  delay: 0
}];
```

- **target**: The addition will be made to the container that matches this selector.
- **filename**: The name of the file to import.
- **path**: the URL to a local version of the file.
- **suffix**: Add a cache buster suffix to the path.
- **wrapper**: Enclose the content in this HTML wrapper.
- **delay**: delay the insertion by this much.

## Operating the script

Press "~" to repeat all the replacements without refreshing the page.
