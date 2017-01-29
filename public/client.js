/*global io*/
/*jslint browser: true*/
var socket = io();
var i;

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

/*** Fonctions utiles ***/

/**
 * Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire d'anciens messages
 */
function scrollToBottom() {
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages li').last().outerHeight() >= $(document).height()) {
    $('html, body').animate({ scrollTop: $(document).height() }, 0);
  }
}

/*** Gestion des événements ***/

/**
 * Connexion de l'utilisateur
 * Uniquement si le username n'est pas vide et n'existe pas encore
 */
$('#login form').submit(function (e) {
  e.preventDefault();
  var user = {
    username : "1HC2"
  };
  if (user.username.length > 0) { // Si le champ de connexion n'est pas vide
    socket.emit('user-login', user, function (success) {
      if (success) {
        $('body').removeAttr('id'); // Cache formulaire de connexion
        $('#chat input').focus(); // Focus sur le champ du message
      }
    });
  }
});

/**
 * Envoi d'un message
 */
$('#chat form').submit(function (e) {
  e.preventDefault();
  var message = {
    text : $('#m').val()
  };
  message.person = $('#user').val();
  $('#user').val('');
  $('#m').val('');
  if (message.text.trim().length !== 0) { // Gestion message vide
    socket.emit('chat-message', message);
  }

  $('#chat input').focus(); // Focus sur le champ du message
});

/**
 * Envoi formulaire
 */

 $('#form_alert').submit(function (e) {
  e.preventDefault();
  var info = {
    uep : "1HC2",
    poste: $('input[name=optradio]:checked').val(),
    duree: $('input[name=time]:checked').val(),
    commentaire: $('#commentaire').val()
  };
    $('#commentaire').val('');
    console.log(info);
    modal.style.display = "none";
  	$("#led_1HC2").attr('class', 'led-red');
  	$("#hide_btn").css('display', '');
  // if (message.text.trim().length !== 0) { // Gestion message vide
  //   socket.emit('chat-message', message);
  // }

  // $('#chat input').focus(); // Focus sur le champ du message
});

 $( "#btn_green" ).click(function() {
  $("#led_1HC2").attr('class', 'led-green');
  $( "#hide_btn" ).css('display', 'none');
});

/**
 * Réception d'un message
 */
socket.on('chat-message', function (message) {
	console.log(message);
	console.log(message.person);
	for (i = 0; i < message.log.length; i++) {
	console.log(message.log);
	console.log(message.log[i]);
		if(message.person == message.log[i].username){
  			$('#messages').append($('<li>').html('<span class="username">' + message.username + '</span> ' + message.text));
  			break;
		} else {
	  		$('#messages').append($('<li class="logout">').html('<span class="info">Error</span> Invalid User'));
	  		break;
		};
	}
  scrollToBottom();
});

/**
 * Réception d'un message de service
 */
socket.on('service-message', function (message) {
  $('#messages').append($('<li class="' + message.type + '">').html('<span class="info">information</span> ' + message.text));
  scrollToBottom();
});

/**
 * Connexion d'un nouvel utilisateur
 */
socket.on('user-login', function (user) {
  $('#users').append($('<li class="' + user.username + ' new">').html(user.username + '<span class="typing">typing</span>'));
  setTimeout(function () {
    $('#users li.new').removeClass('new');
  }, 1000);
});

/**
 * Déconnexion d'un utilisateur
 */
socket.on('user-logout', function (user) {
  var selector = '#users li.' + user.username;
  $(selector).remove();
});

/**
 * Détection saisie utilisateur
 */
var typingTimer;
var isTyping = false;

$('#m').keypress(function () {
  clearTimeout(typingTimer);
  if (!isTyping) {
    socket.emit('start-typing');
    isTyping = true;
  }
});

$('#m').keyup(function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(function () {
    if (isTyping) {
      socket.emit('stop-typing');
      isTyping = false;
    }
  }, 500);
});

/**
 * Gestion saisie des autres utilisateurs
 */
socket.on('update-typing', function (typingUsers) {
  $('#users li span.typing').hide();
  for (i = 0; i < typingUsers.length; i++) {
  	if (typingUsers[i] != null){
    	$('#users li.' + typingUsers[i].username + ' span.typing').show();
	};
  }
});