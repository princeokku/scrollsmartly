/* 
 * scrollsmartly.js
 * Copyright (c) 2013 Shinnosuke Watanabe
 * https://github.com/shinnn
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * This branch is originated from:
 *
 *   scrollsmoothly.js
 *   Copyright (c) 2008 KAZUMiX
 *   http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly
 *   Licensed under the MIT License:
*/

var smartly = {};

// Preference
smartly.easing = 0.25;
smartly.interval = 15;
smartly.first = true;
smartly.initScroll = true;
smartly.callback = function(){
};

(function(){
	smartly.scrollingTo = null;
	smartly.scrolledTo = null;

	var targetX = 0, targetY = 0, targetElm, targetHash = '';
	var currentX = 0, currentY = 0;
	var prevX = null, prevY = null;
	var rootElm = document.documentElement || document.body;
  
	//ハッシュが '#' 一文字のみである場合、それを取り除く
	if(location.hash === '' && history.replaceState !== undefined){
		history.replaceState("", document.title, location.pathname);
	}
	
	var addEvent, removeEvent, addClickEvent;
	if(window.addEventListener !== undefined){
		addEvent = function(elm, eventType, func){
			elm.addEventListener(eventType, func, false);
		};
		
		removeEvent = function(elm, eventType, func){
			elm.removeEventListener(eventType, func, false);
		};

		addClickEvent = function(elm){
			elm.addEventListener('click', startScroll, false);
		};
	}else if(window.attachEvent !== undefined || // IE
	'attachEvent' in window){ // Old Opera
		addEvent = function(elm, eventType, func){
			elm.attachEvent('on'+eventType, func);
		};
		
		removeEvent = function(elm, eventType, func){
			elm.detachEvent('on'+eventType, func);
		};

		addClickEvent = function(elm){
			elm.attachEvent('onclick', function(){startScroll.apply(elm);});
		};
	}
	
	var hashChangeAvailable = (window.onhashchange !== undefined);
	if(hashChangeAvailable){
		var scrollPrevented = false;
		
		var onBackOrForward = function(){
      if(scrollPrevented){
				scrollPrevented = false;
				return;
			}
      scrollTo(currentX, currentY);
			smartly.scroll(location.hash.substr(1) || '');
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
	
	if(smartly.first === true){
		addEvent(window, 'load', function(){ smartly.init(); });
	}
	
	var startScroll;
	smartly.init = function(loadEvent){
		removeEvent(window, 'hashchange', onBackOrForward);
		addEvent(window, 'hashchange', onBackOrForward);
		removeEvent(window, 'scroll', finishScroll);
		addEvent(window, 'scroll', finishScroll);	

		if(loadEvent){
			startScroll = function(event){
        if(this.dataset.noscroll === 'true'){
          scrollPrevented = true;
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        smartly.scroll(this.hash.substr(1)); // linkElms[i].hash
			};
		}else if('event' in window){ // IE
			startScroll = function(){
        if(this.dataset.noscroll === 'true'){
          scrollPrevented = true;
          return;
        }
				window.event.returnValue = false;
				window.event.cancelBubble = true;
				smartly.scroll(this.hash.substr(1)); // linkElms[i].hash
			};
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
					addClickEvent(linkElms[i]);
				}else if(hashStr === ''){
					addClickEvent(linkElms[i]);
				}
			}
		}
		
		// 外部からページ内リンク付きで呼び出された場合
		if(smartly.initScroll && location.hash !== ''){
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
		// ハッシュからターゲット要素の座標を取得
		targetElm = hash !== ''? document.getElementById(hash): rootElm;
		if(targetElm === null){ return; }
		targetHash = hash;

		if(hashChangeAvailable){
			removeEvent(window, 'scroll', finishScroll);
		}

		// スクロール停止中ならスクロール開始
		if(smartly.scrollingTo === null){
			smartly.scrollingTo = targetHash;
			processScroll();
		}
		return targetHash;
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
		var vx = (targetX - currentX) * smartly.easing;
		var vy = (targetY - currentY) * smartly.easing;
		if((Math.abs(vx) < 1 && Math.abs(vy) < 1) ||
		(prevX === currentX && prevY === currentY)){
			// 目標座標付近に到達していたら終了
			scrollTo(targetX, targetY);
			smartly.scrollingTo = null;
			if(targetHash === ''){
				if(location.hash !== '' && history.pushState !== undefined){
					if(hashChangeAvailable){
						removeEvent(window, 'hashchange', onBackOrForward);
						addEvent(window, 'scroll', finishScroll);
						setTimeout(function(){
							addEvent(window, 'hashchange', onBackOrForward);
						}, 30);
					}
					history.pushState('', document.title, location.pathname);					
				}
			}else if(targetHash !== location.hash){
				if(hashChangeAvailable){
					removeEvent(window, 'hashchange', onBackOrForward);
					addEvent(window, 'scroll', finishScroll);
					setTimeout(function(){
						addEvent(window, 'hashchange', onBackOrForward);
					}, 30);
				}
				location.hash = targetHash;
			}
			smartly.scrolledTo = targetHash;
			if(typeof smartly.callback === 'function'){
				smartly.callback();
			}
			prevX = prevY = null;
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
		var hashStr = hashArg? String(hashArg): '';
		if(!elm.hash ||
			(elm.dataset.noscroll !== undefined && hashArg !== undefined)){
			elm.hash = '#' + hashStr;
		}else if(elm.hash){
			elm.hash = '#';
		}
		if(elm.dataset.noscroll !== undefined || elm.dataset.noscroll === 'true'){
			elm.dataset.noscroll = 'false';
		}else{
			addClickEvent(elm);
		}
		elm.style.cursor = 'pointer';
	};

	smartly.off = function(elm){
		elm.dataset.noscroll = 'true';
		elm.style.cursor = '';
	};
	
}());
