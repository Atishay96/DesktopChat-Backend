class Response{
	errorInternal(err, res){
		console.error('error occured');
		console.error(err);
		return res.status(500).send({message:"Internal Server Error", error:err});
	}
	message(res, status, message){
		return res.status(status).send({message});
	}
	success(res, data, message){
		if(message){
			message = 'Operation Successful';
		}
		return res.send({message, data});
	}
	badValues(res){
		return res.status(400).send({message: "Bad Values"});
	}
	sessionExpired(res){
		return res.status(401).send({message: "Session Expired. You've been logged in from some other device"})
	}
	notFound(res, message){
		if(!message){
			message = 'Not Found';
		}
		return res.status(404).send({message});
	}
	notAuthorized(res, message){
		return res.status(405).send({message});
	}
}

Response = new Response();
module.exports = Response;