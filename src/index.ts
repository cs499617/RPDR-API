/**
 * This is the index
 * Christeen Shlimoon
 */
// imports
import * as bodyParser from 'body-parser'
import { AppDataSource } from './data-source'
import {UserController} from './controller/UserController'
import {QueenController} from './controller/QueenController'
import RunwayController from './controller/RunwayController'
import {createExpressServer} from 'routing-controllers'
import * as createError from 'http-errors'

//cors options
const corsOptions = {
	origin: /localhost\:\d{4,5}$/i, // localhost any 4 digit port
	credentials: true, // needed to set and return cookies
	allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
	methods: 'GET,PUT,POST,DELETE',
	maxAge: 43200, // 12 hours
}
//the port number for our server
const portNumber= process.env.PORT || 3004;
const express = require('express');
const path = require('path');


AppDataSource.initialize().then(async () => {

	// create express app
	const app = createExpressServer({
		cors: corsOptions,
		controllers: [UserController, QueenController, RunwayController],
	})



	// Allow access to the images directory
	app.use('/images', express.static('src/images'));

	app.use(bodyParser.json())


	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		next(createError(404))
	})
	// error handler
	app.use(function(err, req, res, next) {
		if(!res._headerSent) {
			res.status(err.status || 500)
			res.json({status: err.status, message: err.message, stack: err.stack.split(/\s{4,}/)})
		}
	})

	app.listen(portNumber);


	console.log(`Express server has started on port ${portNumber}. Open
http://localhost:${portNumber}/users to see results`);
}).catch(error => console.log(error))






