var express = require('express');
var router = express.Router();


//init opentok
var OpenTok = require('opentok')
var opentok = new OpenTok('45139682', 'e2b8ce0f78d31ba4854f2464105d582bc17829ae');

router.get('/new',function(req,res){
	opentok.createSession(function(err, session) {
  		if (err) 
  			return res.status(500).json({error:err})

  		res.status(200).json({session:{
  			id:session.sessionId
  		}})
	});
})
.get('/token/:session',function(req,res){

	token = opentok.generateToken(req.params.session,{
		expireTime: (new Date().getTime() / 1000)+( 60 * 60) //let token expire after one hour
	});
	res.status(200).json({token:token})
})
module.exports = router;