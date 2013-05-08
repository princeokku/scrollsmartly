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

(function(){
	var currentHref_WOHash = location.href.split('#')[0];
	
	var _inner = {
		"scrollProcessInterval": 15,
		"stillLoading": true,
		"callback": undefined,
		"delayedFunctionsQueue": [],
		"transit": [],
		"mutated": null,
		"reachedCurrentTarget": true
	};
	
	smartly.set = function(){
		switch (arguments.length){
			case 1:
			if(typeof arguments[0] === 'object'){
				for(var key in arguments[0]){
					if(smartly.hasOwnProperty(key)){
						smartly[key] = arguments[0][key];
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
		var func, time = 0, args = [];

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
				waitObj[key] = setDelay(smartly[key], time);
			}else{
				waitObj[key] = smartly[key];				
			}
		}
		
		function setDelay(origFunc, delay){
			return function(){
				var origArgs = arguments;
				
				var delayedFunction = function(){
					setTimeout(function(){
						if(typeof func === 'function'){
							func.apply(this, args);					
						}
						origFunc.apply(smartly, origArgs);
					}, delay);
				};

				if(smartly.scrollingTo !== null){
					_inner.delayedFunctionsQueue[_inner.delayedFunctionsQueue.length] = delayedFunction;

				}else{
					delayedFunction();
				}
				
				if(time !== -1){
					return smartly;
				}
				return smartly.delay(-1);
			};
		}
		
		return waitObj;
	};
	
	function dequeue(){
		if(_inner.delayedFunctionsQueue.length > 0){
			console.log(_inner.delayedFunctionsQueue);
			var currentQueue = _inner.delayedFunctionsQueue.shift();
				currentQueue();
		}
	}
	
	//Preference
	smartly.easing = 4;
	smartly.scrollingTo = null;
	smartly.scrolledTo = null;
	smartly.hashScrollSynced = true;
	smartly.scrollHashSynced = true;
	
	smartly.start = {"x": 0, "y": 0};
	smartly.current = smartly.end = smartly.scrollable = smartly.start;
	
	smartly.position = 'left top';
	smartly.marginLeft = 0;
	smartly.marginTop = 0;
		
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

	var onBackOrForward = function(e){
		// 履歴の前後ではなく、本ライブラリのスクロールにより hashchange イベントが起きた場合
		if(! historyMoved || ! smartly.hashScrollSynced){ return; }
		
		scrollTo(currentX, currentY);
		smartly.scroll(location.hash.substring(1));
			
		// HashChangeEvent の cancelable プロパティは false なので、return false; などは不要
	};
	
	var scrollTimerID = null;
		
	var scrollCompleteHandler = function(){
		if(scrollTimerID !== null){
			clearTimeout(scrollTimerID);
		}
		scrollTimerID = setTimeout(function(){
			getCurrentXY();
		}, 150);
	};
	
	var resizeTimerID = null;
	
	var resizeCompleteHandler = function(){
		if(resizeTimerID !== null){
			clearTimeout(scrollTimerID);
		}
		
		resizeTimerID = setTimeout(function(){
			reportMutated();
		}, 50);
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
				if(this.scrollSmartlyTarget !== undefined){
					smartly.scroll(this.scrollSmartlyTarget);					
				}else{
					smartly.scroll(this.hash.substring(1));
				}
			};
			
			setCustomHTMLEvent = function(eventType){
				var htmlEvent = document.createEvent('HTMLEvents');
				htmlEvent.initEvent(eventType, false, false);
				window['on'+eventType] = null;

				addEvent(window, eventType, function(e){
					if(typeof window['on'+eventType] === 'function'){
						window['on'+eventType](e);
					}else if(window['on'+eventType] !== null){
						console.log('on'+eventType+':', window['on'+eventType]); // デバッグ用
					}
				});
				
				return htmlEvent;
			};
		
		}else if('event' in window){ // IE

			startScroll = function(){
				var self = event.srcElement || event.target;
				event.returnValue = false;
				event.cancelBubble = true;
				smartly.scroll(self.hash.substring(1));
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
						console.log('on'+eventType+':', window['on'+eventType]);
					}
				});
			
				return htmlEvent;
			};
		}
		
		smartlyStartEvent = setCustomHTMLEvent('smartlystart');
		smartlyEndEvent = setCustomHTMLEvent('smartlyend');
		
		// https://developer.mozilla.org/ja/docs/DOM/EventTarget.addEventListener
		// #Multiple_identical_event_listeners
		addEvent(window, 'hashchange', onBackOrForward);
		addEvent(window, 'scroll', scrollCompleteHandler);
		addEvent(window, 'resize', resizeCompleteHandler);
		
		// 本関数が再度呼ばれても何もしない
		basicSettings = function(){};
	};

	addEvent(document, 'DOMContentLoaded', function(e){
		basicSettings(e);
	});
		
	addEvent(window, 'load', function(e){
		basicSettings(e);
				
		getCurrentXY();
		getWindowSize();
		
		// 外部からページ内リンク付きで呼び出された場合
		if(smartly.hashScrollSynced && (location.hash !== '' || smartly.homeElement !== rootElm)){
			if(window.attachEvent !== undefined &&
			window.opera === undefined){ // IE
				// 少し待ってからスクロール
				setTimeout(function(){
					scrollTo(0, 0);
					smartly.scroll(location.hash.substring(1) || smartly.homeElement);
				}, 30);
			}else{
				scrollTo(0, 0);
				smartly.scroll(location.hash.substring(1) || smartly.homeElement);
			}
		}
		
		addEvent(document.body, 'click', holdDefaultHashChange);
		
		delete _inner.stillLoading;
	});

	function holdDefaultHashChange(clickEvent){
		if(! smartly.hashScrollSynced){ return; }

		var evt = clickEvent || event; //tmp
		var elm = evt.target || evt.srcElement;
		if(elm.href !== undefined && elm.href.indexOf('#') !== -1){
			console.log(elm.href);
			resetHashChangeEvent(false);	
		}
	}

	// https://developer.mozilla.org/ja/docs/JavaScript/Reference/Global_Objects/Array/isArray#Compatibility
	var isArray;
	if(Array.isArray !== undefined){
		isArray = Array.isArray;
	}else{
		var isArraySub = Object.prototype.toString.call;
		isArray = function(obj){
			return isArraySub(obj) === '[object Array]';
		};
	}
		
	smartly.scroll = function(){
		
		var targets = [''];
		var callback = null;
		var easing = '';
		
		switch (arguments.length){
			case 0:
			break;
			
			case 1:
			if(typeof arguments[0] === 'object'){
				if(arguments[0].nodeType === 1){
					// 引数が一つのELEMENT Nodeであった場合
					targets[0] = arguments[0];
					
				}else if(arguments[0].via !== undefined){
					if(isArray(arguments[0].via)){
						// viaプロパティが配列であった場合
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
		
		setTargetXY();

		// スクロール中にターゲット要素が移動した際、追跡するかどうか
		if(observer !== undefined){
			observer.observe( document.body, {
				attributes: true,
				subtree: true,
				characterData: false
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
		
		removeEvent(window, 'scroll', scrollCompleteHandler);
		resetHashChangeEvent(true);
		
		_inner.reachedCurrentTarget = false;
		processScroll();
				
		return smartly;
	};
	
	var scrollProcessID;
	
	var round = Math.round;
	var abs = Math.abs;
	
	function processScroll(){
		
		if(_inner.mutated === true){
			// スクロール中にターゲット要素に対するDOMの変更があった場合、再度ターゲット要素の座標を取得する
			setTargetXY();
			console.log('mutated');

			if(observer !== undefined){
				_inner.mutated = false;
			}
		}
		
		getCurrentXY();
		
		if(smartly.easing < 1){
			smartly.easing = 1;
		}
		
		var vx = (targetX - currentX) / smartly.easing;
		var vy = (targetY - currentY) / smartly.easing;
		
		if(//(abs(vx) < 0.1 && abs(vy) < 0.1) ||
		(prevX === currentX && prevY === currentY) ||
		_inner.reachedCurrentTarget){ // 目標座標付近に到達した場合
			
			if(observer !== undefined){
				observer.disconnect(); // DOMの変更通知の受取を止める
			}
			
			addEvent(window, 'scroll', scrollCompleteHandler);

			// scroll.stop が呼ばれていた場合
			if(_inner.reachedCurrentTarget){ return; }
			
			scrollTo(targetX, targetY);
			smartly.scrolledTo = targetElm;
			_inner.reachedCurrentTarget = true; // 直近の目標に到達したことを表す
						
			if(_inner.transit.length > 0){ // 経由する要素がまだ残っている場合
				smartly.scroll(_inner.transit.shift());
				
			}else{ // 経由すべき要素は残っていないため、スクロールを完了する				
				setLocationHash();
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
		prevX = currentX;
		prevY = currentY;
		scrollTo(round(currentX + vx), round(currentY + vy));
		
		scrollProcessID = setTimeout(
			function(){ processScroll(); },
			_inner.scrollProcessInterval
		);
	}
	
	if(jQuery){
		
		var page = (function(){
			var line = document.createElement('div');
			line.style.position = 'absolute';
			line.style.top = line.style.left = '0';
			line.style.width = '1px';
			line.style.height = '100%';
			line.style.margin = '0px';
			line.style.padding = '1px 0 0 0';
			line.style.border = 'none';
			line.style.visibility = 'hidden';

			document.body.appendChild(line);
			
			var topElm = document.body;
			var initialTop = topElm.scrollTop;
			if(initialTop < 1){
				topElm.scrollTop = 1;
			}else{
				topElm.scrollTop = initialTop - 1;		
			}
	
			if(topElm.scrollTop === initialTop){
				topElm = document.documentElement;
			}else{
				topElm.scrollTop = initialTop;				
			}

			document.body.removeChild(line);
			return topElm;
		}());
		
		page = $(page);
		
		window.jsmartly = function(elm, speedArg, es){
			var offset = $(elm).offset();
			var pageOffset = page.offset();
			console.log(page.scrollLeft(), page.scrollTop());
		
			var complete = function(){console.log('c');};
			var distance = Math.sqrt(
				Math.pow(page.scrollLeft() - offset.left, 2) +
				Math.pow(page.scrollTop() - offset.top, 2)
			);
		
			var speed = speedArg || 3.5;
			var duration = parseInt(distance / speed, 10);

			page.animate({
				scrollLeft: offset.left,
				scrollTop: offset.top
			},{
				duration: duration || 550,
				easing: es || 'easeOutExpo',
				//progress: function(a1,a2,a3){console.log(a1,a2,a3);},
				complete: complete
			});
	
			//return $(this);
		};
	}
	
	function jQueryScroll(){
		//tmp
	}
	
	function setLocationHash(){
		if(! smartly.scrollHashSynced ||
		targetHash === location.hash.substring(1) || _inner.delayedFunctionsQueue.length > 0){
			return;
		}
		
		if(targetHash !== ''){
			resetHashChangeEvent(false);

			if(history.pushState !== undefined){
				history.pushState('', document.title, location.pathname + '#' + targetHash);
			
			}else if(focusKeywordChanged() || smartly.marginLeft !== 0 || smartly.marginTop !== 0){
				
					// ハッシュを変更する際に、そのハッシュをid属性に持つ要素へ移動するのを防ぐ必要がある。
					// つまり、location.hash = StringX 呼び出す際に、id属性が StringX である要素が
					// ドキュメント中に存在しないようにする必要がある。
					
					targetElm.id = '';
					location.hash = '#' + targetHash;
					targetElm.id = targetHash;
				
			}else{
				location.hash = '#' + targetHash;				
			}
			
		}else{
			if(location.hash !== '' && history.pushState !== undefined){
				resetHashChangeEvent(false);
				history.pushState('', document.title, location.pathname);					
			}
		}
	}
	
	var hashChangeTimerID;
	
	function resetHashChangeEvent(scrollBeginning){
		if(! smartly.scrollHashSynced){ return; }
		
		if(scrollBeginning){
			clearTimeout(hashChangeTimerID);

		}else{
			// 検知対象の HashChangeEvent では「ない」ことを表す
			historyMoved = false;
			
			// HashChangeEvent が発生し終わった頃に、これから起こる HashChangeEvent が検知対象となるよう再設定する
			hashChangeTimerID = setTimeout( function(){
				historyMoved = true;
			}, 30);
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
		box.style.left = box.style.top = '0';
		box.style.width = box.style.height = '100%';
		box.style.margin = box.style.padding = '0';
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
		var focus = getParsedFocus();
		
		targetX = Math.min(x + focus.x, maxScroll.x);
		if(targetX < 0){
			targetX = 0;
		}

		targetY = Math.min(y + focus.y, maxScroll.y);
		if(targetY < 0){
			targetY = 0;
		}
	}
	
	function focusKeywordChanged(){
		return (smartly.position && smartly.position !== 'left top');
	}
	
	function getParsedFocus(){
		var keywordX = 0;
		var keywordY = 0;

		if(focusKeywordChanged()){
			var words = String(smartly.position).split(' ');
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
			
			fraction = fractionalize(words[0]);
			keywordX = parseInt((windowWidth - elmWidth) * fraction, 10);

			fraction = fractionalize(words[1]);			
			keywordY = parseInt((windowHeight - elmHeight) * fraction, 10);
		}
				
		return {
			"x": - (keywordX + smartly.marginLeft),
			"y": - (keywordY + smartly.marginTop)
		};
	}
	
	function fractionalize(keyword){
		if(keyword === 'left' || keyword === 'top'){
			return 0;
		
		}else if(keyword === 'center'){
			return 0.5;
		
		}else if(keyword === 'right' || keyword === 'bottom'){
			return 1;
		
		}else if(keyword.charAt(keyword.length-1) === '%'){
			return parseFloat(keyword) * 0.01;	
		}
		
		return 0;
	}
	
	smartly.stop = function(){
		_inner.reachedCurrentTarget = true; // 目標に到達「したこと」にし、スクロール処理を終了させる
		_inner.transit= [];
		smartly.scrollingTo = null;
		
		dequeue();
		return smartly;		
	};

	smartly.finish = function(){
		_inner.delayedFunctionsQueue= [];
		smartly.stop();

		return smartly;		
	};
	
	function each(obj, func){
		if(obj === undefined){ return; }
		var items;
		if(obj.length === undefined){ items = [obj]; }
		else{ items = obj; }
		
		for(var i=0; i < items.length; i++){
			func.call(smartly, items[i], i);
		}
	}
	
	smartly.on = function(elm, target){		
		each(elm, function(val){
			if(target !== undefined){
				val.scrollSmartlyTarget = target;
			}else{
				val.scrollSmartlyTarget = '';			
			}

			addEvent(val, 'click', startScroll);
			val.style.cursor = 'pointer';		
		});

		dequeue();
		return smartly;
	};

	smartly.off = function(elm){
		each(elm, function(val){
			delete val.scrollSmartlyTarget;
			removeEvent(val, 'click', startScroll);
			val.style.cursor = '';      
		});
		
		dequeue();
		return smartly;
	};
	
	smartly.replaceAnchor = function(elm, calledFromMethod){
		/*
		**イベントリスナーを登録するリンク**:
		・href属性が '#' で始まるページ内リンクであり、尚かつ、それが指し示すアンカーがページ内に存在するもの
			-> id='anchor' である要素へのスクロール
		・href属性が '#' 一文字のみのリンク -> ドキュメントの最上端へのスクロール
		
		**イベントリスナーを登録しないリンク**:
		・href属性に '#' が含まれないリンク
		・href属性に '#' を含むが、当該リンクのあるページ内のものではない、別ページのアンカーへのリンク
		・href属性を持たないa要素
		*/
		
		var hrefStr = elm.href + '';
		var splitterIndex = hrefStr.lastIndexOf('#'); // '#' が無ければ -1 が代入される
		
		// '#' 以降を除いた文字列が、現在表示しているサイトのURLと一致しているかの判定。
		// '#' が無ければ String.substring(0, -1) つまり '' となり、偽である。
		if(hrefStr.substring(0, splitterIndex) === currentHref_WOHash){
			if(elm.hash !== undefined){ // In HTML4?
				elm.hash = hrefStr.substring(splitterIndex + 1);
			}
			delete elm.scrollSmartlyTarget;
			addEvent(elm, 'click', startScroll);
		}
		
		if(calledFromMethod !== true){
			dequeue();
			return smartly;
		}
	};
	
	smartly.all = function(){
		if(_inner.stillLoading === true){
			addEvent(window, 'load', function(){
				delete _inner.stillLoading;
				smartly.all();
			});
			
			dequeue();
			return smartly;
		}
		// ページ内リンクにイベントを設定する
		var linkElms = document.links; // https://developer.mozilla.org/ja/docs/DOM/document.links
		for(var i=0; i<linkElms.length; i++){
			smartly.replaceAnchor(linkElms[i], true);
		}
		
		dequeue();
		return smartly;
	};
	
}());

smartly.all();
