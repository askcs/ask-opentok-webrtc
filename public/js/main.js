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
		var sessionId = getParam('sessionId')
		if (sessionId != null && sessionId != '') {
			connectOpenTok(sessionId);
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

function setupSession(token, sessionId) {
	session = OT.initSession('45139682', sessionId);
	session.connect(token, function(error) {
		var selfVideo = document.getElementById('selfVideo')
		var publisher = OT.initPublisher('selfVideo');
		session.publish(publisher);
	});

	session.on("streamCreated", function(event) {
		session.subscribe(event.stream,'callerVideo',{fitMode:'contain'});
	});

}