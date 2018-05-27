class Generator{
	async randomNumber(){
		Math.floor(100000 + Math.random() * 900000)
	}
}

Generator = new Generator();
module.exports = Generator;