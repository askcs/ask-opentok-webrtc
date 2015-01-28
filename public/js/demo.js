var selfEasyrtcid = "";
var roomId = '';
var currentTab = '';

//set jquery events
$("#submit").click(function() {
    console.log(document.URL);
    joinRoom();
    console.log('click');
});

/**
 * Tab clickhandlers
 */
$('.video-gesprek').click(function(e){
    e.preventDefault();
    // 'Video Gesprek' is the default tab,
    // so variable could also be empty string
    if (currentTab !== ('video-gesprek' || '')){
        switchTab(e);
    }
});
$('.gesprekken').click(function(e){
    e.preventDefault();
    if (currentTab !== 'gesprekken'){
        switchTab(e);
    }
});
$('.hulp-vragen').click(function(e){
    e.preventDefault();
    if (currentTab !== 'hulp-vragen'){
        switchTab(e);
    }
});

/**
 * Switches tabs and does things relevant to the tab
 * @param  {Object} event Click event from jQuery
 */
function switchTab(event){
    var className = event.currentTarget.className;

    $('#main-navbar .active').removeClass('active');
    $('.'+ className).addClass('active');
    currentTab = className;

    switch (className){
        case 'video-gesprek':
            if(selfEasyrtcid !=='')
                $('#current-call').show();
            $('#help-request').hide();
            $('#active-calls').hide();
            break;
        case 'gesprekken':
            $('#current-call').hide();
            $('#help-request').hide();
            $('#active-calls').show();
            refreshRooms();
            break;
        case 'hulp-vragen':
            $('#current-call').hide();
            $('#help-request').show();
            $('#active-calls').hide();
            break;
    }
}

/**
 * Refresh the current rooms table
 */
function refreshRooms(){
    $.getJSON( "/rooms", function( data ) {
        var items = [];
        $.each( data, function( key, val ) {
            items.push( '<tr><td>'+key+'</td><td>'+val+'</td><td> <a href="/?room='+key+'"">join</a><td>' );
         });
        $('#demo_table_body').html(items.join(""));

        // $( "<ul/>", {~
        //     "class": "my-new-list",
        //     html: items.join( "" )
        // }).appendTo( "#allrooms" );
    });
}

function peerListener(who, msgType, content, targeting) {
    addToConversation(who, msgType, content, targeting);
}


/**
 * unused
 */

function sendMessage(destTargetId, destRoom) {
    var text = document.getElementById('sendMessageText').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }
    var dest;
    var destGroup = getGroupId();
    if (destRoom || destGroup) {
        dest = {};
        if (destRoom) {
            dest.targetRoom = destRoom;
        }
        if (destGroup) {
            dest.targetGroup = destGroup;
        }
        if (destTargetId) {
            dest.targetEasyrtcid = destTargetId;
        }
    }
    else if (destTargetId) {
        dest = destTargetId;
    }
    else {
        easyrtc.showError("user error", "no destination selected");
        return;
    }

    if( text === "empty") {
         easyrtc.sendPeerMessage(dest, "message");
    }
    else {
    easyrtc.sendDataWS(dest, "message", text, function(reply) {
        if (reply.msgType === "error") {
            easyrtc.showError(reply.msgData.errorCode, reply.msgData.errorText);
        }
    });
    }
    addToConversation("Me", "message", text);
    document.getElementById('sendMessageText').value = "";
}

/**
 * Call other easyrtc client, print failure and succes
 * @param  {String} easy rtc id of the other client
 */
function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();
    var successCB = function() {console.log('succesfull call');};
    var failureCB = function() {console.log('not succesfull call');};
    easyrtc.call(otherEasyrtcid, successCB, failureCB);
}

/**
 * called when logged in. If the url has a room number automaticly join that room.
 * @param  {String} EasyRtcID
 * @return {[type]}
 */
function loginSuccess(easyrtcid) {
    hideActiveInfo()
    selfEasyrtcid = easyrtcid;
    try {
        var room = '' + getParam('room');
        console.log('room:"' + room + '"');
        if (room != 'null') {
            easyrtc.joinRoom(room, null,
                function(roomName) {
                    showInfo('Er wordt gezocht naar hulp',info,5000);
                },
                function(errorCode, errorText, roomName) {
                    console.log("had problems joining " + roomName);
                }
            );
        }
    } catch (err) {
        console.log(err);
    }
}

/**
 * 
 * Send alert to server, with the room number and the to adress
 * @param  {[type]}
 * @return {[type]}
 */
function sendAlert(caller) {
    $('form').hide();
    $('#error').show();
    $('#error').text('Wij versturen nu uw verzoek');
    var data = {
        room: $('#roomnum').val(),
        to: $('#email').val()
    };
    $.post('/alert', data).done(function(data) {
        console.log(data);
    });
    //TO DO: set proper domain
    // var url = 'http://teamup.com/sendAlert?roomUrl='+document.URL+'/?room='+encodeURIComponent($('#roomnum').val())+'&clientNumber='+encodeURIComponent($('#roomnum').val());
    // $.get(url,function(data){
    //     console.log(data);
    //     $('#error').text('Uw verzoek is verstuurd. Een hulpverlener zal u zo komen helpen, moment gedulc aub.');
    // })
}

function loginFailure(errorCode, message) {
    var message = ''
    //check if user uses safari of ie
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        message = 'Safari browser word niet ondersteund gebruik Chrome of Firefox op uw desktop'
    } else if( navigator.userAgent.indexOf('MSIE') > -1){
         message = 'Internet explorer browser word niet ondersteund gebruik Chrome of Firefox op uw desktop'
    }else{
        message = 'Webcam kan helaas niet gevonden worden controleer of deze is aangesloten en herlaad de pagina'
    }

    hideActiveInfo()
    $('#videos').hide()
    showInfo(message,'warning',900000);
}
/**
 * Generic function to get the value of a url parameter
 * @param  {String} name of the parameter
 * @return {String} value of the parameter, if does not exist returns null
 */
function getParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results === null)
        return null;
    else
        return results[1];
}



var boxUsed = [true, false, false, false];
var maxCALLERS = 1;
var activeBox = -1;

function getIdOfBox(boxNum) {
    return "box" + boxNum;
}
/**
 * Initate the app and set proper callbacks
 * @return {[type]}
 */
function appInit() {

    // Set the username if this is specified in the url
    if(getParam('username')){
        easyrtc.setUsername(getParam('username'));
    }
    //TODO: set to true before commit
    easyrtc.enableAudio(true);

    easyrtc.setRoomOccupantListener(callEverybodyElse);
    //set the app name and video id's
    easyrtc.easyApp("ask", "selfVideo", ["callerVideo"], loginSuccess,loginFailure);
    easyrtc.setDisconnectListener( function() {
        showInfo('De verbinding met de andere partij is verloren','warning',5000);
    });
    easyrtc.setOnCall( function(easyrtcid, slot) {
        console.log("getConnection count="  + easyrtc.getConnectionCount() );
        boxUsed[slot+1] = true;
        if(activeBox === 0 ) { // first connection
            collapseToThumb();
            document.getElementById('textEntryButton').style.display = 'block';
        }
    });


    easyrtc.setOnHangup(function(easyrtcid, slot) {
        console.log('some one hang up');
        boxUsed[slot+1] = false;
        if(activeBox > 0 && slot+1 == activeBox) {
            collapseToThumb();
        }
        setTimeout(function() {
            document.getElementById(getIdOfBox(slot+1)).style.visibility = "hidden";

            if( easyrtc.getConnectionCount() === 0 ) { // no more connections
                expandThumb(0);
                document.getElementById('textEntryButton').style.display = 'none';
                document.getElementById('textentryBox').style.display = 'none';
            }
            handleWindowResize();
        },20);
    });
}

function callEverybodyElse(roomName, otherPeople) {

    easyrtc.setRoomOccupantListener(null); // so we're only called once.

    var list = [];
    var connectCount = 0;
    for(var easyrtcid in otherPeople ) {
        list.push(easyrtcid);
    }
    //
    // Connect in reverse order. Latter arriving people are more likely to have
    // empty slots.
    //
    function establishConnection(position) {
        function callSuccess() {
            connectCount++;
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        function callFailure(errorCode, errorText) {
            easyrtc.showError(errorCode, errorText);
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        easyrtc.call(list[position], callSuccess, callFailure);

    }
    if( list.length > 0) {
        establishConnection(list.length-1);
    }
}

function showInfo(message, type, duration){
    $('#current-call').prepend('<div class="alert alert-'+type+'" role="alert" style="margin-top: 20px;">'+message+'</div>');
    setTimeout(function(){
        $('.alert').remove()
    },duration)
}

function hideActiveInfo(){
    $('.alert').remove()
}

function disconnectUser(){
    easyrtc.disconnect()
    
}