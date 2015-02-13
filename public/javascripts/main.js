$(function() {
  var socket = io.connect($('#uri').data('uri'));

  var $playerList = $('#player-list');
  var $opinion = $('#player-opinion');
//  var $reload = $('#rating-reload');
  var $ratingTable = $('#user-rating > tbody');
  var $ratingTableRecord = [];
  var $tweetBtn = $('#twitter-tweet-btn');
  var $summary = $('#summaries');
  var $summaryBtn = $('#summary-btn');
  var $summaryMore = $('#summary-more');
  var $momChart = $("#mom-chart");
  var $momLegend = $("#mom-legend");
  var chartCtx = $momChart.get(0).getContext("2d");

  var initCounter = 0;
  function init(data) {

    if (initCounter > 0) { return; }
    if (data.maintenance.valid === true) {
      $('#service-maintenance').show();
      return;
    } else {
      $('#service-open').show();
    }
    initCounter++;

    var groupContent = data.groupContent;
    $('#group-content').text(groupContent);

//    var rand = Math.floor(Math.random () * 1000) + 1;
//    $reload.html('(<a href="http://rating.soccer-king.jp/?rnd=' + rand + '" style="font-size:16px;">更新</a>)');
    $ratingTable.empty();
    $playerList.empty();

    var players = data.players;
    _.each(players, function(item, index) {
      var rank = index + 1;
      $ratingTable.append('<tr><td class="rank" style="text-align: right;">' + rank + '</td><td class="rating-name"></td><td class="rating-value" style="text-align: right;"></td><td class="rating-sum" style="text-align: right;"></td><td class="rating-my-value">評価なし</td></tr>');
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
              + '<input id="player-input-id' + item.id + '" type="text" size="23" placeholder="コメントを入力(任意)">'
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
    _.each($ratingTable.children(), function(item) {
      $ratingTableRecord.push($(item));
    });

    var summaryCache = localStorage.getItem('summary-' + data.group);
    if (!summaryCache) {
      $summaryBtn.off();
      $summaryBtn.on('click', function() {
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
      $('#mom-select').empty();
      $('#mom-select').append('<option value="0" selected>該当者なし</option>');
      _.each(players, function(item) {
        $('#mom-select').append('<option value="' + item.id + '">' + item.fullName + '</option>');
      });
      $('#mom-btn').off();
      $('#mom-btn').on('click', function() {
        var id = $('#mom-select').val();
        socket.emit('post mom', {
          id: id,
          group: data.group
        });
        $('#mom').fadeOut('normal');
        localStorage.setItem('mom-' + data.group, id);
      });
      $('#mom').show();
    }

    showEventView(data.eventInfo);

    $('.player-btn').off();
    $('.player-btn').on('click', function() {
      var playerId = $(this).data('player-id');
      var groupId = $(this).data('group-id');
      var rating = $('#player-select-id' + playerId).val();
      var opinion = $('#player-input-id' + playerId).val();
      localStorage.setItem('player-id:' + groupId + ':' + playerId, rating);
      localStorage.setItem('rating-done:' + groupId, 'true');
      socket.emit('post rating', {
        id: playerId,
        group: data.group,
        rating: rating,
        opinion: opinion,
      });
      $('#player-id-' + playerId).fadeOut('normal');
    });
  }

  function showEventView(eventInfo) {
    if (eventInfo.valid == true) {
      var eventId = eventInfo.events[0].id;
      var cache = localStorage.getItem('event-rating-done:' + eventId);
      if (!cache) {
        $('#event-main').show();
        $('#event-main button').on('click', function() {
          var eventId = eventInfo.events[0].id;
          var rating = $('#event-rating').val();
          var comment = $('#event-comment').val();
          localStorage.setItem('event-rating-done:' + eventId, 'true');
          socket.emit('post event rating', {
            eventId: eventId,
            rating: rating,
            comment: comment,
          });
          $('#event-main').fadeOut('normal');
        });
      }
    }
  }

  function updateRatingView(playersMap, groupId) {
    var ratedPlayers = [];
    var unratedPlayers = [];
    _.each(playersMap, function(item) {
      if (item && (item.ratingSum > 0)) {
        ratedPlayers.push(item);
      } else if (item) {
        unratedPlayers.push(item);
      }
    });
    var sortedRatedPlayers = _.sortBy(ratedPlayers, function(item) {
      return - item.ratingSum / item.ratingNum;
    });

    var rank = 1;
    var nameToRating = [];
    _.each(sortedRatedPlayers, function(item) {
      var avg = (item.ratingSum / item.ratingNum).toFixed(2);
      var myRating = localStorage.getItem('player-id:' + item.group + ':' + item.id);
      var myRatingStr = '評価なし';
      if (myRating) {
        var tmpStr = item.shortName + myRating;
        myRating = parseFloat(myRating);
        if (myRating > 0) {
          nameToRating.push(tmpStr);
          var diff = (myRating - avg).toFixed(2);
          if (diff > 0) {
            myRatingStr = myRating.toFixed(1) + '<span class="plus">(+' + diff + ')</span>';
          } else if (diff >= 0) {
            myRatingStr = myRating.toFixed(1) + '<span class="zero">(' + diff + ')</span>';
          } else {
            myRatingStr = myRating.toFixed(1) + '<span class="minus">(' + diff + ')</span>';
          }
        }
      }
      if ($ratingTableRecord.length > 0) {
        $ratingTableRecord[rank-1].find('.rating-name').text(item.shortName);
        $ratingTableRecord[rank-1].find('.rating-value').text(avg);
        $ratingTableRecord[rank-1].find('.rating-sum').text(item.ratingNum);
        $ratingTableRecord[rank-1].find('.rating-my-value').html(myRatingStr);
      }
      rank++;
    });

    _.each(unratedPlayers, function(item) {
      if ($ratingTableRecord.length > 0) {
        $ratingTableRecord[rank-1].find('.rating-name').text(item.shortName);
        $ratingTableRecord[rank-1].find('.rating-value').text('0.00');
        $ratingTableRecord[rank-1].find('.rating-sum').text('0');
      }
      rank++;
    });

    var ratingFlg = localStorage.getItem('rating-done:' + groupId);
    if (ratingFlg && nameToRating.length > 0) {
      $tweetBtn.off();
      $tweetBtn.on('click', function() {
        var momStr = '';
        var momPlayerId = localStorage.getItem('mom-' + groupId);
        if (momPlayerId) {
          var player = _.find(playersMap, function(item) {
            return momPlayerId == item.id
          });
          if (player) {
            momStr = ' MOM:' + player.shortName;
          }
        }
        location.href='http://twitter.com/share?url=http://rating.soccer-king.jp/&text='+encodeURIComponent(nameToRating.join(' ') + momStr + ' #俺ガゼッタ');
      });
      $tweetBtn.show();
    }
  }

  function updateMomView(playersMap) {
    var filtered = _.filter(playersMap, function(item) {
      return item && item.momNum && (item.momNum > 0);
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

  function updateCommentView(playersMap, groupId) {
    var filtered = _.filter(playersMap, function(item) {
      return item && item.comments && item.comments.length > 0;
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
      if (item.comments && ( item.comments.length > 0 )) {
        var uri = '/player_comments?gid=' + groupId + '&id=' + item.id;
        $opinion.append('<center><div id="player-comment-more-' + item.id + '"><button class="btn more-btn">もっと見る</button></div></center>');
        $('#player-comment-more-' + item.id + '> button').on('click', function() {
          location.href = uri;
        });
      }
    });
  }

  function updateSummaryView(summaries, groupId) {
    $summary.empty();
    $summaryMore.empty();
    _.each(summaries, function(item) {
      $summary.append('<li><div class="bs-callout bs-callout-info">' + item + '</div></li>');
    });
    if (summaries && summaries.length > 0) {
      var uri = '/summaries?gid=' + groupId;
      $summaryMore.append('<button class="btn more-btn">もっと見る</button>');
      $summaryMore.children('button').on('click', function() {
        location.href = uri;
      });
    }
  }

  function updateView(data) {
    var drawType = data.type;
    var playersMap = {};
    _.each(data.players, function(item, index) {
      playersMap[item.id] = item;
      playersMap[item.id].ratingSum = data.ratings.sum[index];
      playersMap[item.id].ratingNum = data.ratings.num[index];
      playersMap[item.id].momNum = data.moms[index];
      playersMap[item.id].comments = data.opinions[item.id];
    });

    if (drawType === 'rating') {
      updateRatingView(playersMap, data.group);
      updateCommentView(playersMap, data.group);
    } else if (drawType === 'all') {
      updateRatingView(playersMap, data.group);
      updateMomView(playersMap);
      updateCommentView(playersMap, data.group);
      updateSummaryView(data.summaries, data.group);
    } else if (drawType === 'mom') {
      updateMomView(playersMap);
    } else if (drawType === 'summary') {
      updateSummaryView(data.summaries, data.group);
    }
  }

  socket.on('login', function(data) {
    init(data);
    updateView(data);
  });

  socket.on('broadcast results', function(data) {
    updateView(data);
  });
});
