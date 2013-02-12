(function(){


	var finishResize = function(){
		if(scrollTimer !== null){
			clearTimeout(scrollTimer);
		}
		scrollTimer = setTimeout(function(){
			resizeSegment();
		}, finishScrollInterval);
	};

	window.onresize = finishResize;
	
	
	segmentIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
	for(var i=0; i < segmentIds; i++){}
	document.getElementById('');
	function resizeSegment(){
	}

}());
