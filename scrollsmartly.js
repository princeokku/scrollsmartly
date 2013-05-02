/* 
 * scrollsmartly.js v0.1
 * Copyright (c) 2013 Shinnosuke Watanabe
 * https://github.com/shinnn
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * This program is the branch originated from:
 *   scrollsmoothly.js
 *   Copyright (c) 2008 KAZUMiX
 *   http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly
 *   Licensed under the MIT License
*/

if(! window.smartly){
	var smartly = {};
}

/* ハッシュのみ変える
function(){
	var el = [$('#page-menu')[0]];
	el[0].id = '';
	location.hash = '#page-menu';
	el[0].id = 'page-menu';
}
*/

(function(){
	var _inner = {
		"initAuto": true,
		"initScroll": true,
		"callback": undefined,
		"queue": [],
		"transit": [],
		"mutated": null,
		"reachedCurrentTarget": true,
		"focusShifted": false
	};
	
	smartly.set = function(){
		switch (arguments.length){
			case 1:
			if(typeof arguments[0] === 'object'){
				for(var key in propertiesObj){
					if(smartly.hasOwnProperty(key)){
						smartly[key] = propertiesObj[key];
					}
				}
			}
			break;
			
			case 2:
			if(smartly.hasOwnProperty(arguments[0])){
				smartly[arguments[0]] = arguments[1];
			}
			break;
		}
		
		dequeue();
		return smartly;
	};

	// 遅延処理メソッド
	smartly.delay = function(){
		var func = function(){};
		var time = 0;
		var args = [];

		switch(arguments.length){
			case 0:
			break;
			
			case 1:
			if(typeof arguments[0] === 'function'){
				func = arguments[0];
			}else{
				time = arguments[0];
			}
			break;
			
			case 2:
			func = arguments[0];
			time = arguments[1];
			break;
			
			default:
			func = arguments[0];
			time = arguments[1];
			for(var i=2; i < arguments.length; i++){
				args[i-2] = arguments[i];
			}
		}
		
		var waitObj = {};
		for(var key in smartly){
			if(typeof smartly[key] === 'function' && key !== 'delay'){
				waitObj[key] = setFunctionDelay(smartly[key], time);
			}else{
				waitObj[key] = smartly[key];				
			}
		}
		
		function setFunctionDelay(origFunc, delay){
			return function(){
				var origArgs = arguments;
				
				var delayedFunction = function(){
					setTimeout(function(){
						func.apply(this, args);
						origFunc.apply(smartly, origArgs);
					}, delay);
				};

				if(smartly.scrollingTo !== null){
					_inner.queue[_inner.queue.length] = delayedFunction;
				}else{
					delayedFunction();
				}
		
				return smartly.delay(0);
			};
		}
		
		return waitObj;
	};	
	
	function dequeue(){
		if(_inner.queue.length > 0){
			console.log(_inner.queue);
			var currentQueue = _inner.queue.shift();
				currentQueue();
		}
	}
	
	//Preference
	smartly.easing = 0.25;
	smartly.interval = 15;
	smartly.scrollingTo = null;
	smartly.scrolledTo = null;
	
	smartly.start = {"x": 0, "y": 0};
	smartly.current = smartly.end = smartly.scrollable = smartly.start;

	smartly.viewpoint = function(){

	};
	smartly.viewpoint.keyword = 'left top';
	smartly.viewpoint.x = 0;
	smartly.viewpoint.y = 0;
		
	var targetX = 0, targetY = 0, targetElm, targetHash = '';
	var currentX = 0, currentY = 0;
	var prevX = null, prevY = null;
	var rootElm = document.documentElement || document.body;
  smartly.homeElement = rootElm;
	var windowWidth = 0, windowHeight = 0;
	
	//ハッシュが '#' 一文字のみである場合、それを取り除く
	if(location.hash === ''&& location.href.indexOf('#') !== -1 &&
	history.replaceState !== undefined){
		history.replaceState('', document.title, location.pathname);
	}
	
	var addEvent, removeEvent;
	if(window.addEventListener !== undefined){
		addEvent = function(elm, eventType, func){
			elm.addEventListener(eventType, func, false);
		};
		
		removeEvent = function(elm, eventType, func){
			elm.removeEventListener(eventType, func, false);
		};
		
	}else if('attachEvent' in window){ // IE and old Opera
		addEvent = function(elm, eventType, func){
			elm.attachEvent('on'+eventType, func);
		};
		
		removeEvent = function(elm, eventType, func){
			elm.detachEvent('on'+eventType, func);
		};
	}
	
	var historyMoved = true;

	var onBackOrForward = function(){
		if(! historyMoved){
			// 履歴の前後ではなく、本ライブラリのスクロールにより hashchange イベントが起きた場合
			return;
		}
		
		scrollTo(currentX, currentY);
		smartly.scroll(location.hash.substring(1) || '');
			
		// HashChangeEvent の cancelable プロパティは false なので、return false; などは不要
	};
	
	var scrollTimerID = null;
	var finishScrollInterval = 150;
		
	var finishScroll = function(){
		if(scrollTimerID !== null){
			clearTimeout(scrollTimerID);
		}
		scrollTimerID = setTimeout(function(){
			getCurrentXY();
		}, finishScrollInterval);
	};
	
	var resizeTimerID = null;
	var resizeCompleteInterval = 30;
		
	var resizeCompleteHandler = function(){
		if(resizeTimerID !== null){
			clearTimeout(scrollTimerID);
		}
		resizeTimerID = setTimeout(function(){
			reportMutated();
		}, resizeCompleteInterval);
	};

	// MutationObserver の polyfill
	MutationObserver = window.MutationObserver ||
	window.WebKitMutationObserver || window.MozMutationObserver || false;
	
	var observer;
	
	function reportMutated(){
		_inner.mutated = true;				
	}
	
	if(MutationObserver){
		observer = new MutationObserver( function(mutations){
			reportMutated();
		});
		
	}else if('onpropertychange' in window){
		observer = {
			"observe": function(elm){
				addEvent(elm, 'propertychange', reportMutated);
			},
			
			"disconnect": function(){
				removeEvent(elm, 'propertychange', reportMutated);				
			}
		};
		
	}else{
		// 変更通知を受け取れないので、以後、常にDOM変更が行われていることを前提に処理する
		_inner.mutated = true;
	}

	var startScroll;
	
	// on + event type のかたちの名を持つイベントリスナーを、当該イベントに登録する関数
	var setCustomHTMLEvent;
	var smartlyStartEvent, smartlyEndEvent;
	
	// 全体の初期設定
	var basicSettings = function(e){
		if(e){
			startScroll = function(clickEvent){
				clickEvent.preventDefault();
				clickEvent.stopPropagation();
				smartly.scroll(this.hash.substring(1)); // linkElms[i].hash
			};
			
			setCustomHTMLEvent = function(eventType){
				var htmlEvent = document.createEvent('HTMLEvents');
				htmlEvent.initEvent(eventType, false, false);
				
				window['on'+eventType] = null;

				addEvent(window, eventType, function(e){
					if(typeof window['on'+eventType] === 'function'){
						window['on'+eventType](e);
					}else if(window['on'+eventType] !== null){
						console.log('on'+eventType, window['on'+eventType]); // デバッグ用
					}
				});
				
				return htmlEvent;
			};
		
		}else if('event' in window){ // IE

			startScroll = function(){
				var self = event.srcElement;
				event.returnValue = false;
				event.cancelBubble = true;
				smartly.scroll(self.hash.substring(1)); // linkElms[i].hash
			};

			setCustomHTMLEvent = function(eventType){
				var htmlEvent = document.createEvent('HTMLEvents');
				htmlEvent.initEvent(eventType, false, false);

				window['on'+eventType] = null;

				addEvent(window, eventType, function(){
					var e = event;
					if(typeof window['on'+eventType] === 'function'){
						window['on'+eventType](e);
					}else if(window['on'+eventType] !== null){
						console.log('on'+eventType, window['on'+eventType]);
					}
				});
			};
		}

		smartlyStartEvent = setCustomHTMLEvent('smartlystart');
		smartlyEndEvent = setCustomHTMLEvent('smartlyend');
		
		basicSettings = function(){};
	};

	addEvent(document, 'DOMContentLoaded', function(e){		
		basicSettings(e);
	});
		
	addEvent(window, 'load', function(e){
		basicSettings(e);
		
		// https://developer.mozilla.org/ja/docs/DOM/EventTarget.addEventListener
		// #Multiple_identical_event_listeners
		addEvent(window, 'hashchange', onBackOrForward);
		addEvent(window, 'scroll', finishScroll);
		addEvent(window, 'resize', resizeCompleteHandler);
		
		getCurrentXY();
		getWindowSize();
		
		// 外部からページ内リンク付きで呼び出された場合
		if(_inner.initScroll && location.hash !== ''){
			if(window.attachEvent !== undefined &&
			window.opera === undefined){ // IE
				// 少し待ってからスクロール
				setTimeout(function(){
					scrollTo(0, 0);
					smartly.scroll(location.hash.substring(1));
				}, 30);
			}else{
				scrollTo(0, 0);
				smartly.scroll(location.hash.substring(1));
			}
		}
		
	});

	
	if(_inner.initAuto === true){
		addEvent(window, 'load', function(){ smartly.all(); });
	}
	
	smartly.all = function(){
		
		var currentHref_WOHash = location.href.split('#')[0];
		// ページ内リンクにイベントを設定する
		var linkElms = document.links;
		for(var i=0; i<linkElms.length; i++){
			var hrefStr = linkElms[i].href;
			var splitterIndex = hrefStr.lastIndexOf('#');

			/*
			イベントリスナーを登録するリンク:
			・href属性が '#' で始まるページ内リンクであり、尚かつ、それが指し示すアンカーがページ内に存在するもの
				-> id='anchor' である要素へのスクロール
			・href属性が '#' 一文字のみのリンク -> ドキュメントの最上端へのスクロール
			
			イベントリスナーを登録しないリンク:
			・href属性に '#' が含まれないリンク
			・href属性に '#' を含むが、当該リンクが指し示すアンカーが存在しないリンク
			・href属性に '#' を含むが、当該リンクのあるページ内のものではない、別ページのアンカーへのリンク
			・href属性を持たないa要素
			*/

			if(hrefStr.substring(0, splitterIndex) === currentHref_WOHash){
				var hashStr = hrefStr.substr(splitterIndex + 1);
				if(hashStr !== '' && document.getElementById(hashStr)){
					addEvent(linkElms[i], 'click', startScroll);
				}else if(hashStr === ''){
					addEvent(linkElms[i], 'click', startScroll);
				}
			}
		}
		
		return smartly;
	};

	smartly.scroll = function(){
		
		var targets = [''];
		var callback = null;
		
		switch (arguments.length){
			case 0:
			break;
			
			case 1:
			if(typeof arguments[0] === 'object'){
				if(arguments[0].via !== undefined){
					if(arguments[0].via.push !== undefined){
						targets = arguments[0].via;
					}else{
						targets = [arguments[0].via];
					}
					
					if(arguments[0].to !== undefined){
						targets.push(arguments[0].to);
					}
					
				}else{
					targets[0] = arguments[0].to;					
				}
				callback = arguments[0].callback !== undefined? arguments[0].callback: callback;

			}else if(typeof arguments[0] !== 'function'){
				targets[0] = arguments[0];

			}else{
				callback = arguments[0];
			}
			break;
			
			case 2:
			if(typeof arguments[1] === 'function'){
				targets[0] = arguments[0];
				callback = arguments[1];				
			}else{
				targets[0] = arguments[0];
				targets[1] = arguments[1];
			}
			break;
			
			default:
			var lastKey = arguments.length-1;
			
			for(var i=0; i < lastKey; i++){
				targets[i] = arguments[i];
			}
			
			if(typeof arguments[lastKey] === 'function'){
				callback = arguments[lastKey];
				
			}else{
				targets[lastKey] = arguments[lastKey];
			}
			
			break;
		}
		
		var currentTarget = targets.shift();
				
		// ターゲット要素の座標を取得
		if(currentTarget.nodeType === 1){ // ELEMENT Node である場合
			targetElm = currentTarget;
			targetHash = currentTarget.id;
			
		}else if(typeof currentTarget === 'string'){
			if(currentTarget !== ''){
				targetElm = document.getElementById(currentTarget);
			}else if(smartly.homeElement){
				targetElm = smartly.homeElement;
			}else{
				targetElm = rootElm;
			}
			
			targetHash = currentTarget;
		}
		
		if(targetElm === null){
			return smartly;
		}
		
		if(targets.length > 0){
			_inner.transit = targets;
		}
		console.log(_inner.transit);
		
		setTargetXY();

		// スクロール中にターゲット要素が移動した際、追跡するかどうか
		if(observer !== undefined){
			observer.observe( targetElm, {
				attributes: true, 
				childList: true,
				characterData: true
			});
		}

		// スクロール中ではない場合、またはスクロール中であっても、次の目標にまだ到達していない場合
		if(smartly.scrollingTo === null || ! _inner.reachedCurrentTarget){
			// スクロールの開始処理
			
			smartly.scrollingTo = targetElm;

			// 'callback' 引数をコールバック関数に設定する
			_inner.callback = callback || null;

			clearTimeout(scrollProcessID);

			// smartlystart イベントを発生させる
			window.dispatchEvent(smartlyStartEvent);			
			
		}else{
			smartly.scrollingTo = targetElm;
		}
		
		removeEvent(window, 'scroll', finishScroll);
		resetHashChangeEvent(true);
		
		_inner.reachedCurrentTarget = false;
		processScroll();
				
		return smartly;
	};
	
	var scrollProcessID;

	function processScroll(){
		
		if(_inner.mutated === true){
			// スクロール中にターゲット要素に対するDOMの変更があった場合、再度ターゲット要素の座標を取得する
			setTargetXY();
			console.log('mutated');
		}
		_inner.mutated = false;

		getCurrentXY();
		
		if(smartly.easing > 1){
			smartly.easing = 1;
		}else if(smartly.easing < 0){
			smartly.easing = 0;
		}
		var vx = (targetX - currentX) * smartly.easing;
		var vy = (targetY - currentY) * smartly.easing;
		
		if((Math.abs(vx) < 1 && Math.abs(vy) < 1) ||
		(prevX === currentX && prevY === currentY) ||
		_inner.reachedCurrentTarget){ // 目標座標付近に到達した場合
			
			if(observer !== undefined){
				observer.disconnect(); // DOMの変更通知の受取を止める
			}
			
			addEvent(window, 'scroll', finishScroll);

			if(_inner.reachedCurrentTarget){ // scroll.cancel が呼ばれていた場合
				return;
			}
			
			scrollTo(targetX, targetY);
			smartly.scrolledTo = targetElm;

			_inner.reachedCurrentTarget = true; // 直近の目標に到達したことを表す
						
			if(_inner.transit.length > 0){ // 経由する要素がまだ残っている場合
				smartly.scroll(_inner.transit.shift());
				
			}else{ // 経由すべき要素は残っていないため、スクロールを完了する				
				//setLocationHash();

				smartly.scrollingTo = prevX = prevY = null;
				
				if(typeof _inner.callback === 'function'){
					_inner.callback();
				}
								
				dequeue();
			
				// smartlyend イベントを発生させる
				window.dispatchEvent(smartlyEndEvent);				
			}

			return;
		}
		
		// 繰り返し
		scrollTo(
			Math.ceil(currentX + vx),
			Math.ceil(currentY + vy)
		);
		prevX = currentX;
		prevY = currentY;

		scrollProcessID = setTimeout(
			function(){ processScroll(); },
			smartly.interval
		);
	}
	
	function setLocationHash(){
		if(targetHash === ''){
			if(location.hash !== '' && history.pushState !== undefined){
				resetHashChangeEvent(false);
				history.pushState('', document.title, location.pathname);					
			}
			
		}else if(targetHash !== location.hash){
			resetHashChangeEvent(false);
			location.hash = targetHash;
		}
	}
	
	var hashChangeTimerID;
	
	function resetHashChangeEvent(scrollBeginning){
		if(scrollBeginning){

			clearTimeout(hashChangeTimerID);

		}else{
			// 検知対象の HashChangeEvent では「ない」ことを表す
			historyMoved = false;
			
			// HashChangeEvent が発生し終わった頃に、これから起こる HashChangeEvent が検知対象となるよう再設定する
			hashChangeTimerID = setTimeout( function(){
				historyMoved = true;
			}, 25);
		}
	}
	
	function getCurrentXY(){
		currentX = document.documentElement.scrollLeft || document.body.scrollLeft;
		currentY = document.documentElement.scrollTop || document.body.scrollTop;
	}	
	
	var getScrollMaxXY;
	
	if(window.scrollMaxX !== undefined){
		getScrollMaxXY = function(){
			return {x: window.scrollMaxX, y: window.scrollMaxY};
		};
	}else{
		getScrollMaxXY = function(){
			var documentSize = getDocumentSize();
			getWindowSize();
			return {
				x: documentSize.width - windowWidth,
				y: documentSize.height - windowHeight
			};
		};
		
		var getDocumentSize = function(){
			return{
				width: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
				height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
			};
		};
	}
	
	var getWindowSize;
	
	if(rootElm.clientWidth !== undefined){
		getWindowSize = function(){
			windowWidth = rootElm.clientWidth;
			windowHeight = rootElm.clientHeight;			
		};
		
	}else if(window.innerWidth){
		var box = document.createElement('div');
		box.style.position = 'absolute';
		box.style.top = '0px';
		box.style.left = '0px';
		box.style.width = '100%';
		box.style.height = '100%';
		box.style.margin = '0px';
		box.style.padding = '0px';
		box.style.border = 'none';
		box.style.visibility = 'hidden';

		getWindowSize = function(){
			document.body.appendChild(box);
			windowWidth = box.offsetWidth;
			windowHeight = box.offsetHeight;			
			document.body.removeChild(box);
		};
	}
		
	function setTargetXY(){
		// スクロール先座標をセットする
		var x = 0;
		var y = 0;
		var elm = targetElm;
		
		while(elm){
			if(elm.offsetLeft !== undefined){
				x += elm.offsetLeft;
				y += elm.offsetTop;
				
			}else{
				var rect = elm.getBoundingClientRect();
				x += rect.left;
				y += rect.top;
			}
			
			elm = elm.offsetParent;
		}
		var maxScroll = getScrollMaxXY();
		
		var viewpoint = parseViewpointKeyword();
		
		targetX = Math.min(
			x - viewpoint.x + smartly.viewpoint.x,
			maxScroll.x
		);
		if(targetX < 0){
			targetX = 0;
		}

		targetY = Math.min(
			y - viewpoint.y + smartly.viewpoint.y,
			maxScroll.y
		);
		if(targetY < 0){
			targetY = 0;
		}
	}
	
	function parseViewpointKeyword(){
		var keywordX = 0;
		var keywordY = 0;

		if(smartly.viewpoint.keyword && smartly.viewpoint.keyword !== 'left top'){
			words = String(smartly.viewpoint.keyword).split(' ');
			if(words.length === 1){
				words[1] = words[0];
			}
			
			var elmWidth, elmHeight;
			if(targetElm.offsetWidth !== undefined){
				elmWidth = targetElm.offsetWidth;
				elmHeight = targetElm.offsetHeight;
				
			}else{
				var targetRect = targetElm.getBoundingClientRect();
				elmWidth = targetRect.width;
				elmHeight = targetRect.height;
			}
			
			var fraction;
			
			switch(words[0]){
				case 'left':
				fraction = 0;
				break;
				
				case 'center':
				fraction = 0.5;
				break;
				
				case 'right':
				fraction = 1;
				break;
				
				default:
				if(words[0].charAt(words[0].length-1) === '%'){
					fraction = parseFloat(words[0]) * 0.01;
				}
				break;
			}
			
			keywordX = parseInt((windowWidth - elmWidth) * fraction, 10);

			switch(words[1]){
				case 'top':
				fraction = 0;
				break;
				
				case 'center':
				fraction = 0.5;
				break;
				
				case 'bottom':
				fraction = 1;
				break;
				
				default:
				if(words[1].charAt(words[1].length-1) === '%'){
					fraction = parseFloat(words[1]) * 0.01;
				}
				break;
			}
			
			keywordY = parseInt((windowHeight - elmHeight) * fraction, 10);
		}
		
		return {"x": keywordX, "y": keywordY};
	}
	
	var actualViewpointShift = {"x": 0, "y": 0};
	
	smartly.cancel = function(){
		_inner.reachedCurrentTarget = true; // 目標に到達「したこと」にし、スクロール処理を終了させる
		_inner.transit= [];
		smartly.scrollingTo = null;
	};
		
	smartly.on = function(elm, hashArg){
		removeEvent(elm, 'click', startScroll);

		var hashStr = hashArg? String(hashArg): '';
		if(!elm.hash || hashArg !== undefined){
			elm.hash = '#' + hashStr;
		}else if(elm.hash){
			elm.hash = '#';
		}

		addEvent(elm, 'click', startScroll);
		elm.style.cursor = 'pointer';
		return elm.hash.substr(1);
	};

	smartly.off = function(elm){
		removeEvent(elm, 'click', startScroll);
		elm.style.cursor = '';
		return elm.hash.substr(1);
	};
	
}());
