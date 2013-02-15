(function(){
	smartly.first = false;
	if(window.addEventListener !== undefined){
		addEvent = function(elm, eventType, func){
			elm.addEventListener(eventType, func, false);
		};
	}else if(window.attachEvent !== undefined || // IE
	'attachEvent' in window){ // Old Opera
		addEvent = function(elm, eventType, func){
			elm.attachEvent('on'+eventType, func);
		};
	}
	
	addEvent(window, 'load', init);
	
	function init(){
		document.body.style.width = '15000px';
		document.body.style.height = '15000px';
		for(var i=0; i < 50; i++){
			var segment = document.createElement('a');
			segment.id = 'seg' + i;
			segment.className = 'segment';
			segment.href = location.pathname + '#seg' + (i+1);
			segment.hash = '#seg' + (i+1);
			segment.style.left = Math.round(Math.random() * 2000) + 'px';
			segment.style.top = Math.round(Math.random() * 2000) + 'px';
			segment.style.backgroundColor = '#' + parseInt(i*5, 10).toString(16) + '';
		
			document.getElementById('container').appendChild(segment);
		}
		
		smartly.init();
		
		function schedule(){
			var elm = document.getElementById('seg' + Math.round(Math.random() * 49));
			elm.style.top = (parseInt(elm.style.top, 10) + Math.round(Math.random() * 1000) - 500) + 'px';
			elm.style.left = (parseInt(elm.style.left, 10) + Math.round(Math.random() * 1000) - 500) + 'px';
			
			setTimeout(function(){ schedule(); }, 4);
		}
		
		schedule();
	}
}());
