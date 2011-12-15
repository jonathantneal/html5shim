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

	// ie print shiv

	// replaces an element with a namespace-shimmed clone (eg. header element becomes shim:header element)
	function namespaceShimElement(element) {
		if (doc.documentMode && doc.documentMode > 7) {
			var elementClone = element.document.createElement('font');
			elementClone.setAttribute('data-html5shiv', element.nodeName.toLowerCase());
		}
		else {
			var elementClone = element.document.createElement('shim:' + element.nodeName);
		}
		while (element.childNodes.length) {
			elementClone.appendChild(element.childNodes[0]);
		}
		for (var a = element.attributes, l = a.length, i = 0; i < l; ++i) {
			if (a[i].specified) {
				elementClone.setAttribute(a[i].nodeName, a[i].nodeValue);
			}
		}
		elementClone.style.cssText = element.style.cssText;
		element.parentNode.replaceChild(elementClone, element);
		elementClone.originalElement = element;
	}

	// restores an element from a namespace-shimmed clone (eg. shim:header element becomes header element)
	function unNamespaceShimElement(element) {
		var originalElement = element.originalElement;
		while (element.childNodes.length) {
			originalElement.appendChild(element.childNodes[0]);
		}
		element.parentNode.replaceChild(originalElement, element);
	}

	// get style sheet list css text
	function getStyleSheetListCssText(styleSheetList, mediaType) {
		// set media type
		mediaType = mediaType || 'all';

		// set local variables
		var
		i = -1,
		cssTextArr = [],
		styleSheetListLength = styleSheetList.length,
		styleSheet,
		styleSheetMediaType;

		// loop through style sheets
		while (++i < styleSheetListLength) {
			// get style sheet
			styleSheet = styleSheetList[i];

			// get style sheet media type
			styleSheetMediaType = styleSheet.media || mediaType;

			// skip a disabled or non-print style sheet
			if (styleSheet.disabled || !/print|all/.test(styleSheetMediaType)) {
				continue;
			}

			// push style sheet css text
			cssTextArr.push(getStyleSheetListCssText(styleSheet.imports, styleSheetMediaType), styleSheet.cssText);
		}

		// return css text
		return cssTextArr.join('');
	}

	// shim css text (eg. header {} becomes shim\:header {})
	function shimCssText (cssText) {
		// set local variables
		var
		elementsRegExp = new RegExp('(^|[\\s\\,\\{\\}])(' + win.html5.elements.join('|') + ')', 'gi'),
		cssTextSplit = cssText.split('{'),
		cssTextSplitLength = cssTextSplit.length,
		i = -1;

		// shim css text
		while (++i < cssTextSplitLength) {
			cssTextSplit[i] = cssTextSplit[i].split('}');
			if (doc.documentMode && doc.documentMode > 7) {
				cssTextSplit[i][cssTextSplit[i].length - 1] = cssTextSplit[i][cssTextSplit[i].length - 1].replace(elementsRegExp, '$1font[data-html5shiv="$2"]');
			}
			else {
				cssTextSplit[i][cssTextSplit[i].length - 1] = cssTextSplit[i][cssTextSplit[i].length - 1].replace(elementsRegExp, '$1shim\\:$2');
			}
			cssTextSplit[i] = cssTextSplit[i].join('}');
		}

		// return shimmed css text
		return cssTextSplit.join('{');
	}

	// the before print function
	win.onbeforeprint = function () {
		// test for scenarios where shimming is unnecessary or unavailable
		if (win.html5.supportsXElement || !doc.namespaces) {
			return;
		}

		// add the shim namespace
		if (!doc.namespaces.shim) {
			doc.namespaces.add('shim');
		}

		// set local variables
		var
		i = -1,
		elementsRegExp = new RegExp('^(' + win.html5.elements.join('|') + ')$', 'i'),
		nodeList = doc.getElementsByTagName('*'),
		nodeListLength = nodeList.length,
		element,
		// sorts style and link files and returns their stylesheets
		shimmedCSS = shimCssText(getStyleSheetListCssText((function (s, l) {
			var arr = [], i = s.length;
			while (i) {
				arr.unshift(s[--i]);
			}
			i = l.length;
			while (i) {
				arr.unshift(l[--i]);
			}
			arr.sort(function (a, b) {
				return (a.sourceIndex - b.sourceIndex);
			});
			i = arr.length;
			while (i) {
				arr[--i] = arr[i].styleSheet;
			}
			return arr;
		})(doc.getElementsByTagName('style'), doc.getElementsByTagName('link'))));

		// loop through document elements
		while (++i < nodeListLength) {
			// get element
			element = nodeList[i];

			// clone matching elements as shim namespaced
			if (elementsRegExp.test(element.nodeName)) {
				namespaceShimElement(element);
			}
		}

		// set new shimmed css text
		doc.appendChild(doc._shimmedStyleSheet = doc.createElement('style')).styleSheet.cssText = shimmedCSS;
	};

	// the after print function
	win.onafterprint = function() {
		// test for scenarios where shimming is unnecessary
		if (win.html5.supportsXElement || !doc.namespaces) {
			return;
		}

		// set local variables
		var
		i = -1,
		nodeList = doc.getElementsByTagName('*'),
		nodeListLength = nodeList.length,
		element;

		// loop through document elements
		while (++i < nodeListLength) {
			// get element
			element = nodeList[i];

			// restore original elements
			if (element.originalElement) {
				unNamespaceShimElement(element);
			}
		}

		// cut new shimmed css text
		if (doc._shimmedStyleSheet) {
			doc._shimmedStyleSheet.parentNode.removeChild(doc._shimmedStyleSheet);
		}
	};
})(this, document);