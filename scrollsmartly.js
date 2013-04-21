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
	//Preference
	smartly.easing = 0.25;
	smartly.interval = 15;
	smartly.applyDefault = true;
	smartly.scrollIn = true;
	smartly.callback = undefined;

	smartly.scrollingTo = null;
	smartly.scrolledTo = null;

	var targetX = 0, targetY = 0, targetElm, targetHash = '';
	var currentX = 0, currentY = 0;
	var prevX = null, prevY = null;
	var rootElm = document.documentElement || document.body;
  
	//ハッシュが '#' 一文字のみである場合、それを取り除く
	if(location.hash === ''&& location.href.indexOf('#') !== -1 &&
	history.replaceState !== undefined){
		history.replaceState("", document.title, location.pathname);
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
	
	var hashChangeAvailable = (window.onhashchange !== undefined);
	var hashChangeTimer;

	if(hashChangeAvailable){
		var historyMoved = true;

		var onBackOrForward = function(){
			if(! historyMoved){
				console.log(6776);
				return;
			}
			
      scrollTo(currentX, currentY);
			smartly.scroll(location.hash.substr(1) || '');
			
			// hashchange イベントの cancelable プロパティは false なので、return false; などは不要
		};
	
		var scrollTimer = null;
		var finishScrollInterval = smartly.interval * 10;
		
		var finishScroll = function(){
			if(scrollTimer !== null){
				clearTimeout(scrollTimer);
			}
			scrollTimer = setTimeout(function(){
				getCurrentXY();
			}, finishScrollInterval);
		};
	}
	
	var startScroll;
	addEvent(window, 'load', function(loadEvent){
		if(loadEvent){
			startScroll = function(clickEvent){
				clickEvent.preventDefault();
				clickEvent.stopPropagation();
				smartly.scroll(this.hash.substr(1)); // linkElms[i].hash
			};
		}else if('event' in window){ // IE
			startScroll = function(){
				var self = event.srcElement;
				event.returnValue = false;
				event.cancelBubble = true;
				smartly.scroll(self.hash.substr(1)); // linkElms[i].hash
			};
		}
	});

	if(smartly.applyDefault === true){
		addEvent(window, 'load', function(){ smartly.init(); });
	}	
	
	smartly.init = function(loadEvent){
		if(hashChangeAvailable){
			addEvent(window, 'hashchange', onBackOrForward);
			addEvent(window, 'scroll', finishScroll);	
		}
		
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
		if(smartly.scrollIn && location.hash !== ''){
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

	smartly.scroll = function(hash){
		resetHashChangeEvent(true);
		// ハッシュからターゲット要素の座標を取得
		targetElm = hash !== ''? document.getElementById(hash): rootElm;
		if(targetElm === null){ return; }
		targetHash = hash;

		// スクロール停止中ならスクロール開始
		if(smartly.scrollingTo === null){
			smartly.scrollingTo = targetElm;
			processScroll();
		}
		return targetElm;
	};

	function processScroll(){
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

		getCurrentXY();
    
		if(smartly.easing > 1){
			smartly.easing = 1;
		}else if(smartly.easing < 0){
			smartly.easing = 0;
		}
		var vx = (targetX - currentX) * smartly.easing;
		var vy = (targetY - currentY) * smartly.easing;
		if((Math.abs(vx) < 1 && Math.abs(vy) < 1) ||
		(prevX === currentX && prevY === currentY)){
			// 目標座標付近に到達していたら終了
			scrollTo(targetX, targetY);
			if(targetHash === ''){
				if(location.hash !== '' && history.pushState !== undefined){
					resetHashChangeEvent(false);
					history.pushState('', document.title, location.pathname);					
				}
			}else if(targetHash !== location.hash){
				resetHashChangeEvent(false);
				location.hash = targetHash;
			}
			smartly.scrolledTo = targetElm;
			smartly.scrollingTo = prevX = prevY = null;
			if(typeof smartly.callback === 'function'){
				smartly.callback();
			}
			return;
		}else{
			// 繰り返し
			var nextX = currentX + vx;
			var nextY = currentY + vy;
			scrollTo(Math.ceil(nextX), Math.ceil(nextY));
			prevX = currentX;
			prevY = currentY;			
			setTimeout(function(){ processScroll(); }, smartly.interval);
		}
	}
	
	function resetHashChangeEvent(scrollBeginning){
		if(hashChangeAvailable){
			return;
		}
		
		if(scrollBeginning){
			removeEvent(window, 'scroll', finishScroll);

			clearTimeout(hashChangeTimer);			
		}else{
			addEvent(window, 'scroll', finishScroll);

			historyMoved = false;
			hashChangeTimer = setTimeout( function(){
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
