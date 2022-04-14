$('.responsive').slick({
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 4,
    nextArrow: false,
    mobileFirst:true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: true,
        dots: false,
        mobileFirst:true,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          mobileFirst:true,
          infinite: true,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          mobileFirst:true,
          infinite: true,
        }
      }
    ]
  });

$(document).ready(function(){
  $('.openButton').click(function(){
    if(!$('.openButton').hasClass('openDone')){
      $('.openButton').addClass('openDone');
      $('nav').css("left","0px");
    }
    else{
      $('.openButton').removeClass('openDone');
      $('nav').css("left", "-999px");
    }
  });

  $(window).resize(function(){
    if($(window).width()>1200){
      $('nav ul li').removeAttr('style');
    }
  });
});