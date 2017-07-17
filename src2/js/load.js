(function(){
	var progressValue = 0;

	var loadHtml = [
	    '<div class="mdLoading">',
	    '    <div class="loadingBox">',
	    '        <div class="title">',
	    '            <div class="titleBox">',
	    '                <img class="line2" src="images/logo.png">',
	    '            </div>',
	    '        </div>',
	    '        <p class="percentage js-count">100%</p>',
	    '        <div class="progressBar">',
	    '            <div class="progress js-bar" style="width:0"></div>',
	    '        </div>',
	    '    </div>',
	    '</div>'
	].join('');
	var dLoad = $(loadHtml);
	var dCount = dLoad.find('.js-count');
	var dBar = dLoad.find('.js-bar');
	var queue = new createjs.LoadQueue();
	var md = new MobileDetect(window.navigator.userAgent);
	var isMobile = md.phone() != null || md.tablet() != null  || window.innerWidth <= 640;
	var loadArray = [];

	for(i=0; i < 32 ; i++){
		loadArray.push({
			id: i+1, 
			src:"/images/d"+ (i+1) + '.png'
		});
	}

	queue.loadManifest(loadArray);

	var handleComplete = function() {

    	$( window ).trigger( "loadCompleted");
        $('.js-wrap').css({'visibility':'visible'}); 
 		
	    TweenMax.to(dLoad,1,{opacity:0,ease:Power4.easeOut,onComplete:function(){
	        dLoad.remove();
	    }});
	   
	};

	$(document).ready(function() {
		dLoad.appendTo('body');	
	});

	queue.on("complete", handleComplete, this);
	queue.on("progress", function(){
	    var procValue = Math.min(Math.ceil(queue.progress*100),100);
	    dCount.text(procValue+'%');
	    dBar.css({
	        'width': procValue+'%'
	    });


	});
	
})();