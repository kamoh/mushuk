var socket = io.connect('http://mushuk-dev.herokuapp.com');

socket.on('connect_success', function (data) {
    HideHeader();
    console.log("Connect Success!");

    currentRoom = data.room;
    console.log(currentRoom);
    queue = currentRoom.queue;
    if(queue.length>0){
        UpdateQueueElements();
    }

    if(currentRoom.isPlaying){
        StartTrack(queue[0],data.pos);
    }

    socket.on('user_left', function (data) {
        console.log(data.name + " left!");
    });

    socket.on('user_joined', function (data) {
        console.log(data.name + " joined!");
    });

    socket.on('queue_update', function (data) {
        queue = data.queue;
        UpdateQueueElements();
    });

    socket.on('start_next_song', function () {
        StartTrack(queue[0],0);
    });
});

function StartTrack(track,pos){
    soundManager.stop('currentSound');
    soundManager.destroySound("currentSound");
    var art;
    if(track.artwork_url!=null){
        art = track.artwork_url.replace("-large", '-crop');
    }
    else{
        art="http://gfm.fm/assets/img/default-albumart.png";
    }
    $("#album_art").attr('src',art)
    $("#song_name").html(track.title);
    $("#user_name").html(track.user.username);
    $('#soundcloud_link').attr('href',track.permalink_url);

    currentSound = soundManager.createSound({
        id: "currentSound", // optional: provide your own unique id
        url: track.stream_url + '?client_id=' + cid,
        autoLoad: true,
        autoPlay: true,
        multiShot: false,
        multiShotEvents: false,
        muted: isMuted,
        position: pos,
        whileplaying: function() {
                document.getElementById('song_progress').value = this.position/this.duration;
        }
    });

    //onfinish: function(){StartNextTrack();}

    //$("#play_button").attr('class','glyphicon glyphicon-pause');
}


function TogglePlay(){
    currentSound.togglePause();
    if(currentSound.paused){
       // $("#play_button").attr('class','glyphicon glyphicon-play');
    }
    else{
        //$("#play_button").attr('class','glyphicon glyphicon-pause');
    }
}

function ToggleMute(){
    currentSound.toggleMute();
    isMuted = currentSound.muted;
    if(isMuted){
       $("#mute_button").attr('class','glyphicon glyphicon-volume-off');
    }
    else{
        $("#mute_button").attr('class','glyphicon glyphicon-volume-up');
    }
}

function AddToQueue(track){
    socket.emit('add_to_queue', { track: track});
}

function RequestNextTrack(){
    socket.emit('request_next_track');
}

function StartNextTrack(){
    if(queue.length>1){
        queue.shift();
        UpdateQueueElements();
        StartTrack(queue[0],0);
    }
    else{
        console.log("Queue Empty!");
    }
}

function Search(){
    var query = document.getElementById("search").value;

    SC.get('/tracks', { q: query}, function(tracks) {
      console.log(tracks);
      latestSearchResults.length = 0;
      latestSearchResults = tracks;
      $("#search_results").empty();
      for (var i=0; i<tracks.length; i++) {
          RenderSearchResult(i,tracks[i]);
      };
    });
}

function UpdateQueueElements(){
    //Clear queue elements
    $("#queue").empty();
    for (var i=0; i<queue.length; i++) {
        if(i>0){
            RenderQueueElement(i);
        }
    }
}

function RenderQueueElement(elementNum){
    var track = queue[elementNum];

    var id      = track.id;
    var title   = "<h4>" + track.title + "</h4>";
    var user    = "<h5>" + track.user.username + "</h5>";

    var listItem = $('<li></li>')
    .appendTo($("#queue"))
    .attr('class', "list-group-item");

    var row = $('<div></div>')
    .appendTo(listItem)
    .attr('class', "row");

    var art;
    if(track.artwork_url!=null){
        art = track.artwork_url;
    }
    else{
        art="http://gfm.fm/assets/img/default-albumart.png";
    }

    var colImage = $('<img>')
    .appendTo(row)
    .attr('src', art)
    .attr('class', "col-md-4");

    var colText = $('<div></div>')
    .appendTo(row)
    .attr('class', "col-md-8");

    colText.append(title + user);
}

function RenderSearchResult(resultNum,track){
    var id      = track.id;
    var title   = "<h4>" + track.title + "</h4>";
    var user    = "<h5>" + track.user.username + "</h5>";

    var listItem = $('<button></button>')
    .appendTo($("#search_results"))
    .attr('type',"button")
    .attr('class', "list-group-item")
    .bind('click', function(){AddToQueue(latestSearchResults[resultNum]);});

    var row = $('<div></div>')
    .appendTo(listItem)
    .attr('class', "row");

    var art;
    if(track.artwork_url!=null){
        art = track.artwork_url.replace("-large", '-t67x67');
    }
    else{
        art="http://gfm.fm/assets/img/default-albumart.png";
    }

    var colImage = $('<img>')
    .appendTo(row)
    .attr('src', art)
    .attr('class', "col-md-1");

    var colText = $('<div></div>')
    .appendTo(row)
    .attr('class', "col-md-9");

    colText.append(title + user);
}
