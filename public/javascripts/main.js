$(function() {
  var socket = io.connect($('#uri').data('uri'));

  function init(data) {
    var $playerList = $('#player-list');
    $playerList.empty();
    var players = data.players;
    _.each(players, function(item) {
      var cache = localStorage.getItem('player-id' + item.id);
      if (cache) {
        return;
      }

      $playerList.append('<li id="player-id-' + item.id + '">'
        + '<div class="row">'
          + '<div class="col-xs-3">'
            + '<div class="text-center">'
              + '<div id="player-img-' + item.id + '"></div>'
              + '<div class="player-name">' + item.shortName + '</div>'
            + '</div>'
          + '</div>'
          + '<div class="col-xs-9">'
            + '<div class="player-input">'
              + '<input id="player-input-id' + item.id + '" type="text" size="23" placeholder="評価コメントを入力">'
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

    var summaryCache = localStorage.getItem('summary-' + data.group);
    if (summaryCache) {
        $('#summary').hide();
    } else {
      $('#summary-btn').on('click', function() {
        socket.emit('post summary', {
          comment: $('#summary-comment').val(),
          group: data.group
        });
        $('#summary').fadeOut('normal');
        localStorage.setItem('summary-' + data.group, data.group);
      });
    }

    var momCache = localStorage.getItem('mom-' + data.group);
    if (momCache) {
      $('#mom').hide();
    } else {
      _.each(players, function(item) {
        $('#mom-select').append('<option value="' + item.id + '">' + item.fullName + '</option>');
      });

      $('#mom-btn').on('click', function() {
        socket.emit('post mom', {
          id: $('#mom-select').val(),
          group: data.group
        });
        $('#mom').fadeOut('normal');
        localStorage.setItem('mom-' + data.group, data.group);
      });
    }

    $('.player-btn').on('click', function() {
      var playerId = $(this).data('player-id');
      var rating = $('#player-select-id' + playerId).val();
      var opinion = $('#player-input-id' + playerId).val();
      localStorage.setItem('player-id' + playerId, rating);
      socket.emit('post rating', {
        id: playerId,
        group: data.group,
        rating: rating,
        opinion: opinion,
      });
      $('#player-id-' + playerId).fadeOut('normal');
    });
  }

  function updateCommentView(data) {
    var playersMap = {};
    _.each(data.players, function(item, index) {
      playersMap[item.id] = item;
      playersMap[item.id].ratingSum = data.ratings.sum[index];
      playersMap[item.id].ratingNum = data.ratings.num[index];
      playersMap[item.id].momNum = data.moms[index];
      playersMap[item.id].comments = data.opinions[item.id];
    });

    var $table = $('#user-rating');
    $table.empty();
    $table.append('<thead><tr><th>順位</th><th>Name</th><th>平均</th><th>投票数</th><th>あなた</th></tr></thead><tbody></tbody>');
    var $tbody = $('#user-rating > tbody');

    var filteredForRating = _.filter(playersMap, function(item) {
      return item.ratingSum > 0;
    });
    var sortedRatings = _.sortBy(filteredForRating, function(item) {
      return - item.ratingSum / item.ratingNum;
    });
    var rank = 1;
    _.each(sortedRatings, function(item) {
      var avg = (item.ratingSum / item.ratingNum).toFixed(1);
      var myRating = localStorage.getItem('player-id' + item.id);
      var myRatingStr = '評価なし';
      if (myRating) {
        myRating = parseFloat(myRating);
        if (myRating > 0) {
          var diff = (myRating - avg).toFixed(1);
          if (diff > 0) {
            myRatingStr = myRating.toFixed(1) + '<span class="plus">(+' + diff + ')</span>';
          } else if (diff >= 0) {
            myRatingStr = myRating.toFixed(1) + '<span class="zero">(' + diff + ')</span>';
          } else {
            myRatingStr = myRating.toFixed(1) + '<span class="minus">(' + diff + ')</span>';
          }
        }
      }
      $tbody.append('<tr><td>' + rank + '</td><td>' + item.shortName + '</td><td>' + avg + '</td><td>' + item.ratingNum + '</td><td>' + myRatingStr + '</td></tr>');
      rank++;
    });

    var filteredForMom = _.filter(playersMap, function(item) {
      return item.momNum > 0;
    });

    var sortedMoms = _.sortBy(filteredForMom, function(item) {
      return - item.momNum;
    });
    var segments = [];
    var CHART_COLOR = ['#aaf2fb', '#ffb6b9', '#ffe361', '#fbaa6e', '#A8BECB'];
    _.each(sortedMoms, function(item, index) {
      segments.push({ label: item.shortName, color: CHART_COLOR[index], value: parseInt(item.momNum) });
    });
    var options = {
      legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\">&nbsp;&nbsp;&nbsp;</span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
    };
    $("#mom-chart").empty();
    var ctx = $("#mom-chart").get(0).getContext("2d");
    var momChart = new Chart(ctx).Doughnut(segments, options);
    $("#mom-chart").css({'width':'150', 'height':'150'});
    $("#mom-legend").html(momChart.generateLegend());

    var filteredForComment = _.filter(playersMap, function(item) {
      return item.comments.length > 0;
    });

    var $opinion = $('#player-opinion');
    $opinion.empty();
    _.each(filteredForComment, function(item) {
      $opinion.append('<h3>' + item.fullName + '</h3>');
      $opinion.append('<ul id="player-comment-' + item.id + '"></ul>');
      var $comment = $('#player-comment-' + item.id);
      _.each(item.comments, function(comment) {
        $comment.append('<li><div class="bs-callout bs-callout-info">' + comment + '</div></li>');
      });
    });

    $opinion.append('<h3>総評</h3><ul id="summaries"></ul>');
    var $summary = $('#summaries');
    _.each(data.summaries, function(item) {
      $summary.append('<li><div class="bs-callout bs-callout-info">' + item + '</div></li>');
    });
  }

  socket.on('login', function(data) {
    init(data);
    updateCommentView(data);
  });

  socket.on('broadcast results', function(data) {
    updateCommentView(data);
  });
});
