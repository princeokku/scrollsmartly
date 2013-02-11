/* 
 * scrollquickly.js
 * Copyright (c) 2013 Shinnosuke Watanabe
 * https://github.com/shinnn
 * Licensed under the MIT License:
 * 
 * This branch is originated from:
 *
 *   scrollsmoothly.js
 *   Copyright (c) 2008 KAZUMiX
 *   http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly
 *   Licensed under the MIT License:
*/

(function(){
	// Preference
	var easing = 0.25;
	var interval = 20;
	var activateInitialScroll = false;

	var targetX = 0, targetY = 0, targetHash = '';
	var scrolling = false;
	var prevX = null, prevY = null;
	
	var rootElm = document.documentElement || document.body;
	var anchorElms = {'#': rootElm};

	var addEvent;
	if(window.addEventListener){
		addEvent = function(eventTarget, eventName, func){
			eventTarget.addEventListener(eventName, func, false);
		};
	}else if(window.attachEvent){ // IE
		addEvent = function(eventTarget, eventName, func){
			eventTarget.attachEvent('on'+eventName, function(){func.apply(eventTarget);});
		};
	}

	addEvent(window, 'load', init);

	var startScroll;
	function init(loadEvent){
		if(loadEvent){
			startScroll = function(event){
				event.preventDefault();
				setScroll(this.hash || '#'); // linkElms[i].hash
			};
		}else if(window.event){ // IE
			startScroll = function(){
				window.event.returnValue = false;
				setScroll(this.hash || '#'); // linkElms[i].hash
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
				var anchorElm = document.getElementById(hashStr);
				if(anchorElm){
					anchorElms['#' + hashStr] = anchorElm;
					addEvent(linkElms[i], 'click', startScroll);
				}else if(hashStr === ''){
					addEvent(linkElms[i], 'click', startScroll);
				}
			}
		}
		
		// 外部からページ内リンク付きで呼び出された場合
		if(activateInitialScroll){
			if(window.attachEvent && !window.opera){
				// IEの場合は少し待ってからスクロール
				setTimeout(function(){
					scrollTo(0, 0);
					setScroll('#' + location.href.split('#')[0]);
				}, 50);
			}else{
				scrollTo(0, 0);
				setScroll('#' + location.href.split('#')[0]);
			}
		}
	}

	function setScroll(hash){
		// ハッシュからターゲット要素の座標を取得
		var targetElm = anchorElms[hash];

		// スクロール先座標をセットする
		var x = 0;
		var y = 0;
		while(targetElm){
			x += targetElm.offsetLeft;
			y += targetElm.offsetTop;
			targetElm = targetElm.offsetParent;
		}
		var maxScroll = getScrollMaxXY();
		targetX = Math.min(x, maxScroll.x);
		targetY = Math.min(y, maxScroll.y);
		targetHash = hash;
		// スクロール停止中ならスクロール開始
		if(!scrolling){
			scrolling = true;
			scroll();
		}
	}

	function scroll(){
		var currentX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var currentY = document.documentElement.scrollTop || document.body.scrollTop;
		var vx = (targetX - currentX) * easing;
		var vy = (targetY - currentY) * easing;
		var nextX = currentX + vx;
		var nextY = currentY + vy;
		if((Math.abs(vx) < 1 && Math.abs(vy) < 1) ||
		(prevX === currentX && prevY === currentY)){
			// 目標座標付近に到達していたら終了
			scrollTo(targetX, targetY);
			scrolling = false;
			location.hash = targetHash;
			prevX = prevY = null;
			return;
		}else{
			// 繰り返し
			scrollTo(parseInt(nextX, 10), parseInt(nextY, 10));
			prevX = currentX;
			prevY = currentY;
			setTimeout(function(){ scroll(); }, interval);
		}
	}
	
	var getScrollMaxXY;
	if(window.scrollMaxX && window.scrollMaxY){
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
		if(rootElm.clientWidth){
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
	
}());
