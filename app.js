/*
 * Global Variables
 */
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require('cloudinary');
var timeout = require('connect-timeout');

/**
 * Cloudinary Configuration
 */
// use cloudinary info on dashboard
cloudinary.config({
	cloud_name: 'droid-vic',
	api_key:'155589199721117',
	api_secret: '7hcW9fsJP7Xnm9TZx2lLjh-Y0jY'
});

var app = express();

/*
 * DB connection
 */
mongoose.connect('mongodb://localhost/vegan_restaurant');

/**
 * Body Parser to help us to parse all the data
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/**
 * Specify where to store files from the server
 * Multer changed its library, before, you could just specify
 * where did you wanted to store your images but now
 * you have to use the new .single or .array to specify
 * how many images you want to send.
 */
app.use(multer({dest: "uploads/"}).single('avatar'));





/**
 * Define Schema of the products
 */
var productsSchema = {

	title: String,
	description: String,
	price: Number,
	imgeUrl: String

};

/**
 * Define Model
 */
var Product = mongoose.model('Product', productsSchema);

/*
 * Set Engines, Views
 */
app.set('view engine', 'jade'); // view

/*
 * Define Routes
 */
app.use(express.static('public')); // public folder

/*
 * Rendering, Get, Post
 */
// respond to Get or Post
app.get('/', function(req, res) {
	// respond with render
	res.render('index', {pageTitle: 'NodeJS'});
});


// add the menu view
app.get('/menu', function(req, res) {
	// find products in the right document
	Product.find(function(err, doc) {
		// render the menu
		if( err ) {
			console.log(err);
		}
		res.render('menu/index', {products: doc});
	});
});

/**
 * adding products
 */
app.post('/menu', function( req, res, next ) {

 	// to place a product, the user must enter the password
 	// if user password matches the password that is set
 	// then show index.html
 	// otherwise show menu.html
 	if ( req.body.pass == '123456789' ) {
		// parsing the data into a JSON object
	 	// console.log(req.bodyParser);

	 	// obtaining the data from the user with the already defined schema
	 	var data = {
			title: req.body.title,
			description: req.body.description,
			price: req.body.price,
			imgeUrl: req.body.avatar
		}

		// create a new product adquired from the data JSON
		var product = new Product( data );

		// always check before save
		// check whats the console answer if you upload a file
		console.log( req.file );

		
		/**
		 * Upload images to cloudinary
		 */
		cloudinary.uploader.upload(req.file.path, function(result) {
			// set the path from the result
			product.imgeUrl = result.url;
			// save product once it is on the cloud
			product.save(function(err) {
				console.log(product); 
				res.render('index');
			});
		}, // you can specify your own ID, etc.. cloudinary.com have more docs.
		{
			public_id: req.file.originalname, 
			crop: 'limit',
			width: 500,
			height: 500,
		});

		// upload(req, res, function (err) {
		//     if (err) {
		//       // An error occurred when uploading
		//       return
		//     }

		//     // Everything went fine
		// 	// save the product to the console just to 
		// 	// check everything is working properly
		// 	// if product is ok, then show index.html
			// product.save(function( err ) {
			// 	console.log(product);
			// 	res.render('index');
			// });
		// 	next();
		// })

 	} else {
 		// in case user didn't place the correct password, show the menu again
 		res.render('menu/new');
 	}


 	// res.render('menu/new');

 });


/**
 * creating the views
 */
app.get('/menu/new', function( req, res ) {
	// rendering the new views
	res.render('menu/new');
});

/*
 * Listen to Port
 */
app.listen(8080); // now in the terminal run $ node app.js
