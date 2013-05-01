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
	var _inner = {};

	_inner.initAuto = true;
	_inner.initScroll = true;
	_inner.callback = null;
	_inner.mutated = null;
	
	//Preference
	smartly.easing = 0.25;
	smartly.interval = 15;
	smartly.scrollingTo = null;
	smartly.scrolledTo = null;
	smartly.isFollowing = true;
		
	smartly.start = {'x': 0, 'y': 0};
	smartly.current = smartly.end = smartly.start;
	
	smartly.shiftTo = function(){
		
	};
	
	var targetX = 0, targetY = 0, targetElm, targetHash = '';
	var currentX = 0, currentY = 0;
	var prevX = null, prevY = null;
	var rootElm = document.documentElement || document.body;
  smartly.homeElement = rootElm;
	
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
		smartly.scroll(location.hash.substr(1) || '');
			
		// hashchange イベントの cancelable プロパティは false なので、return false; などは不要
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

	// MutationObserver の polyfill
	MutationObserver = window.MutationObserver ||
	window.WebKitMutationObserver || window.MozMutationObserver || false;
	
	var observer;
	if(MutationObserver){
		observer = new MutationObserver( function(mutations){
			_inner.mutated = true;
		});
		
	}else{
		// 変更通知を受け取れないので、以後、常にDOM変更が行われていることを前提に処理する
		_inner.mutated = true;
	}

	// カスタムイベント
	var smartlyStartEvent = document.createEvent('HTMLEvents');
	smartlyStartEvent.initEvent('smartlystart', false, false);
	
	var smartlyEndEvent = document.createEvent('HTMLEvents');
	smartlyEndEvent.initEvent('smartlyend', false, false);
	
	var startScroll;
	
	// on + event type のかたちの名を持つイベントリスナーを、当該イベントに登録する関数
	var handleCustomEvent;
	
	// 全体の初期設定
	addEvent(window, 'load', function(loadEvent){
		if(loadEvent){
			
			startScroll = function(clickEvent){
				clickEvent.preventDefault();
				clickEvent.stopPropagation();
				smartly.scroll(this.hash.substr(1)); // linkElms[i].hash
			};
			
			handleCustomEvent = function(eventType){
				window['on'+eventType] = null;

				addEvent(window, eventType, function(e){
					if(typeof window['on'+eventType] === 'function'){
						window['on'+eventType](e);
					}
				});
			};
		
		}else if('event' in window){ // IE

			startScroll = function(){
				var self = event.srcElement;
				event.returnValue = false;
				event.cancelBubble = true;
				smartly.scroll(self.hash.substr(1)); // linkElms[i].hash
			};

			handleCustomEvent = function(eventType){
				window['on'+eventType] = null;

				addEvent(window, eventType, function(){
					var e = event;
					if(typeof window['on'+eventType] === 'function'){
						window['on'+eventType](e);
					}
				});
			};
		}
		
		handleCustomEvent('smartlystart');
		handleCustomEvent('smartlyend');
		
		getCurrentXY();
	});

	
	if(_inner.initAuto === true){
		addEvent(window, 'load', function(){ smartly.init(); });
	}
	
	smartly.init = function(){
		// https://developer.mozilla.org/ja/docs/DOM/EventTarget.addEventListener#Multiple_identical_event_listeners
		addEvent(window, 'hashchange', onBackOrForward);
		addEvent(window, 'scroll', finishScroll);	
		
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
		
		// 外部からページ内リンク付きで呼び出された場合
		if(_inner.initScroll && location.hash !== ''){
			if(window.attachEvent !== undefined &&
			window.opera === undefined){ // IE
				// 少し待ってからスクロール
				setTimeout(function(){
					scrollTo(0, 0);
					smartly.scroll(location.hash.substr(1));
				}, 50);
			}else{
				scrollTo(0, 0);
				smartly.scroll(location.hash.substr(1));
			}
		}
	};

	smartly.scroll = function(){
		var target = '';
		var callback = null;
		
		switch (arguments.length){
			case 0:
			break;
			
			case 1:
			if(typeof arguments[0] !== 'function'){
				target = arguments[0];
			}else{
				callback = arguments[0];
			}
			break;
			
			default:
			target = arguments[0];
			callback = arguments[1];
		}
		
		resetHashChangeEvent(true);
		
		// ターゲット要素の座標を取得
		if(target.nodeType === 1){
			targetElm = target;
			
			// 後にtargetHashに代入するため、id属性を表す文字列に変換しておく
			target = target.id;
			
		}else if(typeof target === 'string'){
			if(target !== ''){
				targetElm = document.getElementById(target);
			}else if(smartly.homeElement){
				targetElm = smartly.homeElement;
			}else{
				targetElm = rootElm;
			}
		}
		
		if(targetElm === null){
			return false;
		}

		targetHash = target;

		setTargetXY();

		// スクロール中にターゲット要素が移動した際、追跡するかどうか
		if(smartly.isFollowing){
			if(observer !== undefined){
				observer.observe( targetElm, {
					attributes: true, 
					childList: true, 
					characterData: true
				});
			}
		}

		// スクロール停止中ならスクロール開始
		if(smartly.scrollingTo === null){
			smartly.scrollingTo = targetElm;
			processScroll();
		}
		
		// smartlystart イベントを発生させる
		window.dispatchEvent(smartlyStartEvent);
		
		// 'callback' 引数をコールバック関数に設定する
		_inner.callback = callback; 

		return targetElm;
	};

	function processScroll(){
		if(smartly.isFollowing){
			if(_inner.mutated === true){
				// スクロール中に、ターゲット要素に対するDOMの変更があった場合、再度ターゲット要素の座標を取得する
				setTargetXY();
				console.log('mutated');
			}
			_inner.mutated = false;
		}

		getCurrentXY();
		
		if(smartly.easing > 1){
			smartly.easing = 1;
		}else if(smartly.easing < 0){
			smartly.easing = 0;
		}
		var vx = (targetX - currentX) * smartly.easing;
		var vy = (targetY - currentY) * smartly.easing;
		
		if((Math.abs(vx) < 1 && Math.abs(vy) < 1) ||
		(prevX === currentX && prevY === currentY)){ // 目標座標付近に到達していたら終了
			
			if(observer !== undefined){
				observer.disconnect(); // DOMの変更通知の受取を止める
			}
			scrollTo(targetX, targetY);
			
			//
						
			smartly.scrolledTo = targetElm;
			smartly.scrollingTo = prevX = prevY = null;

			if(typeof _inner.callback === 'function'){
				_inner.callback();
			}
			
			// smartlyend イベントを発生させる
			window.dispatchEvent(smartlyEndEvent);
			return;
			
		}else{
			// 繰り返し
			scrollTo(
				Math.ceil(currentX + vx),
				Math.ceil(currentY + vy)
			);
			prevX = currentX;
			prevY = currentY;

			setTimeout(
				function(){ processScroll(); },
				smartly.interval
			);
		}
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
			removeEvent(window, 'scroll', finishScroll);

			clearTimeout(hashChangeTimerID);

		}else{
			addEvent(window, 'scroll', finishScroll);

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
			var windowSize = getWindowSize();
			return {
				x: documentSize.width - windowSize.width,
				y: documentSize.height - windowSize.height
			};
		};
		
		var getDocumentSize = function(){
			return {
				width: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
				height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
			};
		};
		
		var getWindowSize;
		if(rootElm.clientWidth !== undefined){
			getWindowSize = function(){
				return {width: rootElm.clientWidth, height: rootElm.clientHeight};
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
				var result = {width: box.offsetWidth, height: box.offsetHeight};
				document.body.removeChild(box);
				return result;
			};
		}
	}
	
	function setTargetXY(){
		// スクロール先座標をセットする
		var x = 0;
		var y = 0;
		var elm = targetElm;
		while(elm){
			x += elm.offsetLeft;
			y += elm.offsetTop;
			elm = elm.offsetParent;
		}
		var maxScroll = getScrollMaxXY();
		targetX = Math.min(x, maxScroll.x);
		targetY = Math.min(y, maxScroll.y);
	}
	
	smartly.setup =function(applyInitially, scrollInitially){
		if(applyInitially){
			
		}
		if(scrollInitially){
			
		}		
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
