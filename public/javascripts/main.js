$(function() {
  var socket = io.connect($('#uri').data('uri'));

  function createPlayersList(data) {
    var players = data.players;
    _.each(players, function(item) {
      var cache = localStorage.getItem('player-id' + item.id);
      if (cache) {
        return;
      }

      $('#player-list').append('<li id="player-id-' + item.id + '">'
        + '<div class="row">'
          + '<div class="col-xs-3">'
            + '<div class="text-center">'
              + '<div id="player-img-' + item.id + '"></div>'
              + '<div class="player-name">' + item.name + '</div>'
            + '</div>'
          + '</div>'
          + '<div class="col-xs-9">'
            + '<div class="player-input">'
              + '<input id="player-input-id' + item.id + '" type="text" size="23">'
              + '<select id="player-select-id' + item.id + '">'
                + '<option value="10">10</option>'
                + '<option value="9.5">9.5</option>'
                + '<option value="9.0">9.0</option>'
                + '<option value="8.5">8.5</option>'
                + '<option value="8.0">8.0</option>'
                + '<option value="7.5">7.5</option>'
                + '<option value="7.0">7.0</option>'
                + '<option value="6.5">6.5</option>'
                + '<option value="6.0" selected>6.0</option>'
                + '<option value="5.5">5.5</option>'
                + '<option value="5.0">5.0</option>'
                + '<option value="4.5">4.5</option>'
                + '<option value="4.0">4.0</option>'
                + '<option value="3.5">3.5</option>'
                + '<option value="3.0">3.0</option>'
                + '<option value="2.5">2.5</option>'
                + '<option value="2.0">2.0</option>'
                + '<option value="1.5">1.5</option>'
                + '<option value="1.0">1.0</option>'
                + '<option value="0">評価なし</option>'
              + '</select>'
              + '<button type="button" class="btn btn-sm player-btn" data-player-id="' + item.id + '">送信</button>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</li>');

      var $playerImage = $('#player-img-' + item.id);
      $playerImage.css("background-image", "url('/images/" + item.group + '/' + item.id + ".png')");
      $playerImage.addClass('player-img-detail');

    });

    $('.player-btn').on('click', function() {
      var playerId = $(this).data('player-id');
      var rating = $('#player-select-id' + playerId).val();
      var opinion = $('#player-input-id' + playerId).val();
      localStorage.setItem('player-id' + playerId, rating);
      socket.emit('post rating', {
        id: playerId,
        rating: rating,
        opinion: opinion,
      });
      $('#player-id-' + playerId).fadeOut('normal');
    });
  }
  socket.on('login', function(data) {
    createPlayersList(data);
  });
});
