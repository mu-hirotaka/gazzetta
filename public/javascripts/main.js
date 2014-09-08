$(function() {
  var socket = io.connect($('#uri').data('uri'));

  var $playerList = $('#player-list');
  var $opinion = $('#player-opinion');
  var $table = $('#user-rating > tbody');
  var $summary = $('#summaries');
  var $momChart = $("#mom-chart");
  var $momLegend = $("#mom-legend");
  var chartCtx = $momChart.get(0).getContext("2d");

  function init(data) {
    $playerList.empty();
    var players = data.players;
    _.each(players, function(item) {
      var cache = localStorage.getItem('player-id:' + item.group + ':' + item.id);
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
              + '<button type="button" class="btn btn-sm player-btn" data-player-id="' + item.id + '" data-group-id="' + item.group + '">確定</button>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</li>');

      var $playerImage = $('#player-img-' + item.id);
      $playerImage.css("background-image", "url('/images/" + item.group + '/' + item.id + ".png')");
      $playerImage.addClass('player-img-detail');

    });

    var summaryCache = localStorage.getItem('summary-' + data.group);
    if (!summaryCache) {
      $('#summary-btn').on('click', function() {
        socket.emit('post summary', {
          comment: $('#summary-comment').val(),
          group: data.group
        });
        $('#summary').fadeOut('normal');
        localStorage.setItem('summary-' + data.group, data.group);
      });
      $('#summary').show();
    }

    var momCache = localStorage.getItem('mom-' + data.group);
    if (!momCache) {
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
      $('#mom').show();
    }

    $('.player-btn').on('click', function() {
      var playerId = $(this).data('player-id');
      var groupId = $(this).data('group-id');
      var rating = $('#player-select-id' + playerId).val();
      var opinion = $('#player-input-id' + playerId).val();
      localStorage.setItem('player-id:' + groupId + ':' + playerId, rating);
      socket.emit('post rating', {
        id: playerId,
        group: data.group,
        rating: rating,
        opinion: opinion,
      });
      $('#player-id-' + playerId).fadeOut('normal');
    });
  }

  function updateRatingView(playersMap) {
    $table.empty();
    var filtered = _.filter(playersMap, function(item) {
      return item.ratingSum > 0;
    });
    var sorted = _.sortBy(filtered, function(item) {
      return - item.ratingSum / item.ratingNum;
    });
    var rank = 1;
    _.each(sorted, function(item) {
      var avg = (item.ratingSum / item.ratingNum).toFixed(1);
      var myRating = localStorage.getItem('player-id:' + item.group + ':' + item.id);
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
      $table.append('<tr><td style="text-align: right;">' + rank + '</td><td>' + item.shortName + '</td><td style="text-align: right;">' + avg + '</td><td style="text-align: right;">' + item.ratingNum + '</td><td>' + myRatingStr + '</td></tr>');
      rank++;
    });
  }

  function updateMomView(playersMap) {
    var filtered = _.filter(playersMap, function(item) {
      return item.momNum > 0;
    });

    var sorted = _.sortBy(filtered, function(item) {
      return - item.momNum;
    });
    var segments = [];
    var CHART_COLOR = ['#aaf2fb', '#ffb6b9', '#ffe361', '#fbaa6e', '#A8BECB'];
    _.each(sorted, function(item, index) {
      if (index < CHART_COLOR.length) {
        segments.push({ label: item.shortName, color: CHART_COLOR[index], value: parseInt(item.momNum) });
      }
    });
    var options = {
      legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\">&nbsp;&nbsp;&nbsp;</span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
    };
    var chart = new Chart(chartCtx).Doughnut(segments, options);
    $momChart.css({'width':'150', 'height':'150'});
    $momLegend.html(chart.generateLegend());
  }

  function updateCommentView(playersMap) {
    var filtered = _.filter(playersMap, function(item) {
      return item.comments.length > 0;
    });
    $opinion.empty();
    $opinion.append('<h3>みんなのコメント(各々最新3件)</h3>');
    _.each(filtered, function(item) {
      $opinion.append('<h2>' + item.fullName + '</h2>');
      $opinion.append('<ul id="player-comment-' + item.id + '"></ul>');
      var $comment = $('#player-comment-' + item.id);
      _.each(item.comments, function(comment) {
        $comment.append('<li><div class="bs-callout bs-callout-info">' + comment + '</div></li>');
      });
    });
  }

  function updateSummaryView(summaries) {
    $summary.empty();
    _.each(summaries, function(item) {
      $summary.append('<li><div class="bs-callout bs-callout-info">' + item + '</div></li>');
    });
  }

  function updateView(data) {
    var playersMap = {};
    _.each(data.players, function(item, index) {
      playersMap[item.id] = item;
      playersMap[item.id].ratingSum = data.ratings.sum[index];
      playersMap[item.id].ratingNum = data.ratings.num[index];
      playersMap[item.id].momNum = data.moms[index];
      playersMap[item.id].comments = data.opinions[item.id];
    });

    updateRatingView(playersMap);
    updateMomView(playersMap);
    updateCommentView(playersMap);
    updateSummaryView(data.summaries);
  }

  socket.on('login', function(data) {
    init(data);
    updateView(data);
  });

  socket.on('broadcast results', function(data) {
    updateView(data);
  });
});
