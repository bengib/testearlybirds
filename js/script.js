
var rootURL = "https://api.themoviedb.org/3";
var apiKey = "29b4f290e3fdf9c7612586ac8b9fe9ff";

// Par défaut on a 20 films affichés donc la width est de 5%
var movieWidth = 5;

// Appel à l'API en ajax
function getUpcoming(){
  var url = rootURL+"/movie/upcoming?api_key="+apiKey;
  
  $.ajax({
    url: url,
    type: "get",
    dataType: 'json',
    success: function (response) {
      // console.log('success');
      // console.log(response);
      $(document).trigger('upcomingSuccess', response);
    },
    error: function (response) {
      // console.log('error');
      // console.log(response);
      $(document).trigger('upcomingError', response);
    }
  });
}
// On cache le loader une fois le slider créé
function hideLoader(){
  $("#loader").animate({"opacity": "0"}, 1000,function(){ 
      $(this).css("visibility","hidden")
  });
};
// Décalage du slider d'un cran vers la gauche et on replace l'élément le plus à gauche en fin de liste pour pouvoir cycler 
function nextMovie(){
  $("#MoviesList .movie:first-child").animate({"margin-left": "-"+movieWidth+"%"}, 800, function(){  
      $(this).css("margin-left","").appendTo("#MoviesList");  
      var position = $("#MoviesList .movie:first-child").data( "position" );
      $('#tabs li').removeClass('current');
      $('#tabs li[data-position="'+position+'"]').addClass('current');

  }); 
  
}
// On place l'élément précédent à gauche de l'élément actuel et on décale le slider d'un cran vers la droite 
function prevMovie(){
  $("#MoviesList .movie:last-child").css("margin-left","-"+movieWidth+"%").prependTo("#MoviesList"); 
  var position = $("#MoviesList .movie:first-child").data( "position" );
  $("#MoviesList .movie:first-child").animate({"margin-left": "0"}, 800);
  $('#tabs li').removeClass('current');
  $('#tabs li[data-position="'+position+'"]').addClass('current');

}
// Saut dans le slider vers un élément au clic sur un bullet point
function goToMovie(position){
  var current = $("#tabs li.current").data( "position" );

  
  var delta = position-current;
  // Mouvement vers la droite pour un élément précédent 
  if (delta<0) {
    // On place l'élément souhaité avant l'élément actuel
    $("#MoviesList .movie[data-position='"+position+"']").css("margin-left","-"+movieWidth+"%").insertBefore($("#MoviesList .movie:first-child"));
    $("#MoviesList .movie:first-child").animate({"margin-left": "0%"}, 800, function(){ 
      // On repositionne les elements dans le bon ordre à la suite de l'élément pour continuer à cycler le slider
      for (var h = 0; h < -delta; h++) {
        $("#MoviesList .movie[data-position='"+(current-h)+"']").css("margin-left","").insertAfter($("#MoviesList .movie:first-child"));
      } 
       
      var positionTab = $("#MoviesList .movie:first-child").data( "position" );
      $('#tabs li').removeClass('current');
      $('#tabs li[data-position="'+positionTab+'"]').addClass('current');

    }); 
  // Mouvement vers la gauche pour un élément suivant 
  }else if(delta>0){
    // On place l'élément souhaité avant l'élément actuel
    $("#MoviesList .movie[data-position='"+position+"']").insertAfter($("#MoviesList .movie:first-child"));
    $("#MoviesList .movie:first-child").animate({"margin-left": "-"+movieWidth+"%"}, 800, function(){ 
      // On repositionne les elements dans le bon ordre à la suite de la liste pour continuer à cycler le slider
      for (var h = 0; h < delta; h++) {
        $("#MoviesList .movie[data-position='"+(current+h)+"']").css("margin-left","").appendTo("#MoviesList");
      } 
       
      var positionTab = $("#MoviesList .movie:first-child").data( "position" );
      $('#tabs li').removeClass('current');
      $('#tabs li[data-position="'+positionTab+'"]').addClass('current');

    }); 
  }
}

$(document).ready(function() { 
  // Appel à l'API
  getUpcoming();

  // Action bouton précedent
  $('#prevButton').on('click',function(){
    prevMovie();
  });

  // Action bouton suivant
  $('#nextButton').on('click',function(){
    nextMovie();
  });
  
  // Réponse de l'API
  $(document).on('upcomingSuccess', function(event, response){
    var nbMovies = response.results.length;
    movieWidth = 100.0/nbMovies;
    console.log(nbMovies);
    console.log(movieWidth);


    for(var i= 0; i < nbMovies; i++)
    {

      var htmlMovie = "<li class='movie' data-position='"+i+"'>";

      // Gestion de l'image d'arrière plan. Si null on affiche un placeholder
      var urlBackdrop = response.results[i].backdrop_path;
      if (urlBackdrop == null) {
        urlBackdrop = "http://via.placeholder.com/1280x720/444444/?text=+";
        htmlMovie += "<img class='backdrop' src='"+urlBackdrop+"'>";
      }else{
        htmlMovie += "<img class='backdrop' src='https://image.tmdb.org/t/p/w1280"+urlBackdrop+"'>";
      }

      // Gestion de l'image poster. Si null on affiche un placeholder
      var urlPoster = response.results[i].poster_path;
      if (urlPoster == null) {
        urlPoster = "http://via.placeholder.com/500x750?text=image+manquante";
        htmlMovie += "<img class='poster' src='"+urlPoster+"'>";
      }else{
        htmlMovie += "<img class='poster' src='https://image.tmdb.org/t/p/w500"+urlPoster+"'>";
      }

      // Gestion des infos texte
      htmlMovie += "<div class='textContent'>";
      htmlMovie += "<h2 class='title'>"+response.results[i].title+"</h2>";
      htmlMovie += "<p class='overview'>"+response.results[i].overview+"</p>";

      // Gestion de la note
      var vote_average = Math.round(response.results[i].vote_average);
      htmlMovie += "<ul class='score'>";
      for (var j = 1; j < 11; j++) {
        if(j<=vote_average){
          htmlMovie += "<li class='gold'><svg viewBox='0 0 76 73' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g id='' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'><g id='' fill='#F8E81C'><path d='M72.3,24.5 L51.1,21.4 L41.6,2.2 C40.9,0.8 39.5,0 38,0 C36.5,0 35.1,0.9 34.4,2.2 L24.9,21.4 L3.7,24.5 C2.2,24.7 0.9,25.8 0.5,27.2 C0.1,28.6 0.4,30.2 1.5,31.3 L16.9,46.3 L13.3,67.4 C13,68.9 13.7,70.4 14.9,71.3 C16.1,72.2 17.8,72.3 19.1,71.6 L38.1,61.6 L57.1,71.6 C57.7,71.9 58.3,72.1 59,72.1 C59.8,72.1 60.7,71.8 61.4,71.3 C62.6,70.4 63.2,68.9 63,67.4 L59.4,46.3 L74.8,31.3 C75.9,30.2 76.3,28.6 75.8,27.2 C75,25.7 73.8,24.7 72.3,24.5 Z' id=''></path></g></g></svg></li>";
        }else{
          htmlMovie += "<li><svg viewBox='0 0 76 73' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g id='' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'><g id='' fill='#FFFFFF'><path d='M75.5,27.2 C75,25.8 73.8,24.7 72.3,24.5 L51.1,21.4 L41.6,2.2 C40.9,0.8 39.5,0 38,0 C36.5,0 35.1,0.9 34.4,2.2 L24.9,21.4 L3.7,24.5 C2.2,24.7 0.9,25.8 0.5,27.2 C0.1,28.6 0.4,30.2 1.5,31.3 L16.9,46.3 L13.3,67.4 C13,68.9 13.7,70.4 14.9,71.3 C16.1,72.2 17.8,72.3 19.1,71.6 L38.1,61.6 L57.1,71.6 C57.7,71.9 58.3,72.1 59,72.1 C59.8,72.1 60.7,71.8 61.4,71.3 C62.6,70.4 63.2,68.9 63,67.4 L59.4,46.3 L74.8,31.3 C75.6,30.2 76,28.6 75.5,27.2 Z M52.1,42 C51.2,42.9 50.7,44.2 50.9,45.5 L53.5,60.7 L39.8,53.5 C39.2,53.2 38.6,53 37.9,53 C37.2,53 36.6,53.2 36,53.5 L22.3,60.7 L24.9,45.5 C25.1,44.2 24.7,42.9 23.7,42 L12.9,31.2 L28.2,29 C29.5,28.8 30.6,28 31.2,26.8 L38,13 L44.8,26.8 C45.4,28 46.5,28.8 47.8,29 L63.1,31.2 L52.1,42 Z' id=''></path></g></g></svg></li>";
        }
      }
      htmlMovie += "</ul>";
      htmlMovie +="</div>";
      htmlMovie += "</li>";

      // Ajout du film dans la page
      $("#MoviesList").append(htmlMovie);
      
      if (i==0) {
        $('#tabs ul').append('<li class="current" data-position="'+i+'"></li>');
      }else{
        $('#tabs ul').append('<li data-position="'+i+'"></li>');
      }
    }
    // Si on a plus ou moins de 20 films on change les valeurs par défaut
    if(nbMovies != 20){
      $("#MoviesList").css("width",nbMovies*100+"%");
      $("#MoviesList .movie").css("width",movieWidth+"%");
    }
    // Action des bullet points
    $('#tabs li').on('click',function(){
      goToMovie($(this).data( "position" ))
    });

    hideLoader();
  });

  // Erreur dans l'API call
  $(document).on('upcomingError', function(event, result){
    alert("Erreur dans la récupération des films");
  });




});