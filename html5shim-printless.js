/*! HTML5 Shim v3 | @jon_neal @afarkas @rem | MIT/GPL2 Licensed */
(function (win, doc) {
	// feature detection: whether the browser supports unknown elements
	var supportsUnknownElements = (function (a) { a.innerHTML = '<x-element></x-element>'; return a.childNodes.length === 1; })(doc.createElement('a'));

	// feature detection: whether the browser supports default html5 styles
	var supportsHtml5Styles = (function (nav, docEl, compStyle) { docEl.appendChild(nav); return (compStyle = (compStyle ? compStyle(nav) : nav.currentStyle).display) && docEl.removeChild(nav) && compStyle === 'block'; })(doc.createElement('nav'), doc.documentElement, win.getComputedStyle);

	// html5 global so that more elements can be shimmed and also so that existing shimming can be detected on iframes
	// more elements can be added and shimmed with the following code: html5.elements.push('element-name'); shimDocument(document);
	win.html5 = {
		// a list of html5 elements
		elements: 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video'.split(' '),

		// the shim function
		shimDocument: function (scopeDocument) {
			scopeDocument = scopeDocument || doc;

			// test if the document has already been shimmed
			if (scopeDocument.documentShimmed) {
				return;
			}
			scopeDocument.documentShimmed = true;

			// set local variables
			var
			documentCreateElement = scopeDocument.createElement,
			documentCreateDocumentFragment = scopeDocument.createDocumentFragment,
			documentHead = scopeDocument.getElementsByTagName('head')[0],
			documentCreateElementReplaceFunction = function (m) { documentCreateElement(m); };

			// shim for unknown elements
			if (!supportsUnknownElements) {
				// shim the document
				win.html5.elements.join(' ').replace(/\w+/g, documentCreateElementReplaceFunction);

				// shim document create element function
				scopeDocument.createElement = function (nodeName) {
					var element = documentCreateElement(nodeName);
					if (!/^(input|script)$/i.test(nodeName)) {
						win.html5.shimDocument(element.document);
					}
					return element;
				};

				// shim document create element function
				scopeDocument.createDocumentFragment = function () {
					var documentFragment = documentCreateDocumentFragment();
					win.html5.shimDocument(documentFragment);
					return documentFragment;
				};
			}

			// shim for default html5 styles
			if (!supportsHtml5Styles && documentHead) {
				documentHead.insertBefore(documentCreateElement('style'), documentHead.firstChild).styleSheet.cssText = [
					'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}', // Corrects block display not defined in IE6/7/8/9
					'canvas,video{display:inline-block;*display:inline;*zoom:1}', // Corrects inline-block display not defined in IE6/7/8/9
					'[hidden]{display:none}', // Corrects styling for 'hidden' attribute not present in IE7/8/9
					'mark{background:#FF0;color:#000}' // Addresses styling not present in IE6/7/8/9
				].join('');
			}
		}
	};

	// shim the document
	win.html5.shimDocument(doc);
})(this, document);