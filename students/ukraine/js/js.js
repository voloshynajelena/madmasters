
		jQuery(window).on('load', function () {
			var $preloader = jQuery('#page-preloader'),
				$spinner   = $preloader.find('.spinner');// 
		//     $spinner.fadeOut();
			$preloader.delay(1000).fadeOut('slow');
		});


		
		function muveRight (lenght) {
		var c=0,timer = setInterval(function () {
			document.querySelector(".scroll").style.left=c+"px";
			if(c<lenght)
				clearInterval(timer);
			else c=c-10;
		},1);
			
	}