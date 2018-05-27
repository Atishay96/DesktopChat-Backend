class website{
	index(req, res){
		return res.render('../views/login.ejs', {type:'index'});
	}
	signup(req, res){
		return res.render('../views/login.ejs', {type:'signup'});
	}
	login(req, res){
		return res.render('../views/login.ejs', {type:'login'})
	}
}

website = new website();
module.exports = website;