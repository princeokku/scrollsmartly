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
	var activateInitialScroll = true;

	var targetX = 0, targetY = 0, targetHash = '';
	var scrolling = false;
	var prevX = null, prevY = null;
	
	var rootElm = document.documentElement || document.body;
	var anchorElms = {'#': rootElm};

	//ハッシュが '#' 一文字のみである場合、それを取り除く
	if(location.hash === '' && history.replaceState !== undefined){
		history.replaceState("", document.title, location.pathname);
	}
	
	var addEvent, removeEvent;
	var addHashChangeEvent, removeHashChangeEvent;
	if(window.addEventListener !== undefined){
		addEvent = function(elm, eventType, func){
			elm.addEventListener(eventType, func, false);
		};

		addHashChangeEvent = function(){
			window.addEventListener('hashchange', onPopScroll, false);
		};
		removeHashChangeEvent = function(){
			window.removeEventListener('hashchange', onPopScroll, false);			
		};

	}else if(window.attachEvent !== undefined){ // IE
		addEvent = function(elm, eventType, func){
			elm.attachEvent('on'+eventType, function(){func.apply(elm);});
		};

		addHashChangeEvent = function(){
			console.log('setpop');
			window.attachEvent('onhashchange', onPopScroll);
		};
		removeHashChangeEvent = function(){
			window.detachEvent('onhashchange', onPopScroll);			
		};
	}
	
	/*
	function onPopScroll(e){
		console.log(e);
		if(e){
			e.preventDefault();
		}
		setScroll(location.hash || '#');
	}
	*/
	
	addEvent(window, 'load', init);
	
	var startScroll;
	function init(loadEvent){
		if(loadEvent){
			startScroll = function(event){
				event.preventDefault();
				setScroll(this.hash || '#'); // linkElms[i].hash
			};
		}else if('event' in window){ // IE
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
				var anchorElm;
				if(hashStr !== '' && (anchorElm = document.getElementById(hashStr))){
					anchorElms['#' + hashStr] = anchorElm;
					addEvent(linkElms[i], 'click', startScroll);
				}else if(hashStr === ''){
					addEvent(linkElms[i], 'click', startScroll);
				}
			}
		}
		
		// 外部からページ内リンク付きで呼び出された場合
		if(activateInitialScroll && location.hash !== ''){
			if(window.attachEvent !== undefined &&
			window.opera === undefined){ // IE
				// 少し待ってからスクロール
				setTimeout(function(){
					scrollTo(0, 0);
					setScroll(location.hash );
				}, 50);
			}else{
				scrollTo(0, 0);
				setScroll(location.hash);
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
			if(targetHash === '#' && history.pushState !== undefined){
				history.pushState('', document.title, location.pathname);
			}else{
				location.hash = targetHash;
			}
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
		
}());
