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
		for(var i=0; i < 5; i++){
			var segment = document.createElement('a');
			segment.id = 'seg' + i;
			segment.className = 'segment';
			segment.href = location.pathname + '#seg' + (i+1);
			segment.hash = '#seg' + (i+1);
			segment.style.left = Math.round(Math.random() * 5000) + 'px';
			segment.style.top = Math.round(Math.random() * 5000) + 'px';
			segment.style.backgroundColor = '#' + parseInt(i*5, 10).toString(16) + '';
		
			document.getElementById('container').appendChild(segment);
		}
		
		smartly.all();
		smartly.position = 'center center';
		
		function schedule(){
			var elm = document.getElementById('seg' + Math.round(Math.random() * 4));
			$(elm).animate({
				top: '+=' + Math.round(Math.random() * 400 - 200) + 'px',
				left: '+=' + Math.round(Math.random() * 400 - 200) + 'px'				
			},{
				duration: 500,
				easing: 'swing'
			});
			
			setTimeout(function(){ schedule(); }, 500);
		}
		
		schedule();
	}
}());
