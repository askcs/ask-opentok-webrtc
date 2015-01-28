var session;
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

function appInit() {
		var sessionId = getParam('session')
		if (sessionId != null && sessionId != '') {
			connectOpenTok(sessionId);
		}else{
			$('.alert').remove();
			$('.video-container').hide()
			$('#current-call').append('<button type="button" class="btn btn-default btn-lg" onclick="createSession()" id="startCall">Start video gesprek</button>')
		}
	}
	/**
	 * [connectOpenTok description]
	 * @param  {String} sessionId opentok sessionId
	 * @return {[type]}           [description]
	 */
function connectOpenTok(sessionId) {

	//get token for session
	$.getJSON('/session/token/' + sessionId, function(data) {
		setupSession(data.token, sessionId)
	})
}

function createSession(){
	$('#startCall').remove()
	$('.video-container').show()
	$.getJSON('/session/new',function(data){
		connectOpenTok(data.session.id)
	})
}

function setupSession(token, sessionId) {
	session = OT.initSession('45139682', sessionId);
	session.connect(token, function(error) {
		var selfVideo = document.getElementById('selfVideo')
		var publisher = OT.initPublisher('selfVideo',{width:300,height:300});
		session.publish(publisher);
		showSessionUrl(sessionId)
		$('#startCall').remove()
	});

	session.on("streamCreated", function(event) {
		var width = $('#videos').width()
		var height = $('#videos').height()
		session.subscribe(event.stream,'callerVideo',{fitMode:'contain',width:width,height:height});
	});

}
function showSessionUrl(sessionId){
	$('#current-call').append('<div class="input-group"><span class="input-group-addon" id="basic-addon1">Uw video link</span>'+
  '<input type="text" class="form-control" value="'+window.location.protocol+'//'+window.location.hostname+'/?session='+sessionId+'" aria-describedby="basic-addon1"></div>')
}