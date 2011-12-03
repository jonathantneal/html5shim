// Dual licensed under the MIT or GPL Version 2 licenses
// HTML5 Shim v3.0 @jon_neal @afarkas @rem
(function (win, doc) {
	// replaces an element with a namespace-shimmed clone (eg. header element becomes shim:header element)
	function namespaceShimElement(element) {
		var elementClone = element.document.createElement('shim:' + element.nodeName);
		while (element.childNodes.length) elementClone.appendChild(element.childNodes[0]);
		elementClone.style.cssText = element.style.cssText;
		element.parentNode.replaceChild(elementClone, element);
		elementClone.originalElement = element;
	}

	// restores an element from a namespace-shimmed clone (eg. shim:header element becomes header element)
	function unNamespaceShimElement(element) {
		var originalElement = element.originalElement;
		while (element.childNodes.length) originalElement.appendChild(element.childNodes[0]);
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
		styleSheet;

		// loop through style sheets
		while (++i < styleSheetListLength) {
			// get style sheet
			styleSheet = styleSheetList[i];

			// skip a disabled style sheet
			if (styleSheet.disabled) {
				continue;
			}

			// get style sheet media type
			styleSheetMediaType = styleSheet.media || mediaType;

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
		elementsRegExp = new RegExp('(^|[^\\w])(' + win.html5.elements.join('|') + ')([^\\w]|$)', 'gi'),
		cssTextSplit = cssText.split('{'),
		cssTextSplitLength = cssTextSplit.length,
		i = -1;

		// shim css text
		while (++i < cssTextSplitLength) {
			cssTextSplit[i] = cssTextSplit[i].split('}');
			cssTextSplit[i][cssTextSplit[i].length - 1] = cssTextSplit[i][cssTextSplit[i].length - 1].replace(elementsRegExp, '$1shim\\:$2$3');
			cssTextSplit[i] = cssTextSplit[i].join('}')
		}

		// return shimmed css text
		return cssTextSplit.join('{');
	}

	// returns whether the browser supports fictional elements
	var supportsXElement = (function (a) { a.innerHTML = '<x-element></x-element>'; return a.childNodes.length === 1; })(doc.createElement('a'));

	// introduces html5 global so that nested iframes can make use of it
	win.html5 = {
		// a list of html5 elements
		elements: 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video'.split(' '),

		// the shim function
		// more elements can be added and shimmed with the following code: html5.elements.push('element-name'); shimDocument(document);
		shimDocument: function (scopeDocument) {
			scopeDocument = scopeDocument || doc;

			// test for scenarios where shimming is unnecessary
			if (supportsXElement || !scopeDocument || scopeDocument.documentShimmed) return; scopeDocument.documentShimmed = true;

			// set local variables
			var
			documentCreateElement = scopeDocument.createElement,
			documentCreateDocumentFragment = scopeDocument.createDocumentFragment,
			documentHead = scopeDocument.getElementsByTagName('head')[0],
			documentCreateElementReplaceFunction = function (m) { documentCreateElement(m); };

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

			// shim styles
			if (documentHead) documentHead.insertBefore(documentCreateElement('style'), documentHead.firstChild).styleSheet.cssText = [
				'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}', // Corrects block display not defined in IE6/7/8/9
				'canvas,video{display:inline-block;*display:inline;*zoom:1}', // Corrects inline-block display not defined in IE6/7/8/9
				'[hidden]{display:none}', // Corrects styling for 'hidden' attribute not present in IE7/8/9
				'abbr[title]{border-bottom:1px dotted}', // Addresses styling not present in IE7/8/9
				'mark{background:#FF0;color:#000}' // Addresses styling not present in IE6/7/8/9
			].join('');
		},

		// the print shim function
		printShimDocument: function (scopeDocument) {
			// test for scenarios where shimming is unnecessary or unavailable
			if (supportsXElement || !scopeDocument.namespaces) return;

			// add the shim namespace
			if (!scopeDocument.namespaces.shim) scopeDocument.namespaces.add('shim');

			// set local variables
			var
			i = -1,
			elementsRegExp = new RegExp('^(' + win.html5.elements.join('|') + ')$', 'i'),
			nodeList = scopeDocument.getElementsByTagName('*'),
			nodeListLength = nodeList.length,
			element,
			shimmedCSS = shimCssText(getStyleSheetListCssText(scopeDocument.styleSheets));

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
			scopeDocument.appendChild(win.html5._shimmedStyles = scopeDocument.createElement('style')).styleSheet.cssText = shimmedCSS;
		},

		// the print unshim function
		unPrintShimDocument: function (scopeDocument) {
			// test for scenarios where shimming is unnecessary
			if (supportsXElement || !scopeDocument.namespaces) return;

			// set local variables
			var
			i = -1,
			nodeList = scopeDocument.getElementsByTagName('*'),
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
			if (win.html5._shimmedStyles) win.html5._shimmedStyles.parentNode.removeChild(win.html5._shimmedStyles);
		}
	};

	// shim the document
	win.html5.shimDocument(doc);

	// set up print shimming the document
	if (!supportsXElement) {
		win.onbeforeprint = function () {
			// set local variables
			var
			i = -1,
			frame,
			err;

			// printshim any shimable frame documents
			while ((frame = win.frames[++i])) {
				try {
					if (!frame.html5) win.html5.printShimDocument(frame.document);
				}
				catch (err) {}
			}

			// printshim the current document
			win.html5.printShimDocument(doc);
		};
		win.onafterprint = function () {
			// set local variables
			var
			i = -1,
			frame,
			err;

			// unprintshim any shimable frame documents
			while ((frame = win.frames[++i])) {
				try {
					if (!frame.html5) win.html5.unPrintShimDocument(frame.document);
				}
				catch (err) {}
			}

			// unprintshim the current document
			win.html5.unPrintShimDocument(doc);
		}
	}
})(this, document);
