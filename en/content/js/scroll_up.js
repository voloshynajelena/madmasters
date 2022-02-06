 /* Scroll up */
 jQuery(document).ready(function(){
  jQuery(window).scroll(function () {
      if (jQuery(this).scrollTop() > 400) {
        jQuery('#scroller').fadeIn();
      } else {
        jQuery('#scroller').fadeOut();}
      });
      jQuery('#scroller').click(function () {jQuery('body,html').animate({scrollTop: 0}, 400); return false;});
}); 