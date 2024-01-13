/**
 * The purpose of this file is to create the User Controller. Here it is defined how a user can modify a User in our DB
 */
//Imports for what we will use in this file
/* eslint-disable no-mixed-spaces-and-tabs */
import {AppDataSource} from '../data-source'
import {NextFunction, Request, Response} from 'express'
import {JsonController, Get, Req, Param, Post, Res, Delete, Body, Put, UseBefore} from 'routing-controllers'
//my own entity
import {User} from '../entity/User'
import {authenticateToken} from "../services/AuthMiddleware";
import {AuthService} from "../services/AuthService";


@JsonController()
export class UserController {

    private userRepository = AppDataSource.getRepository(User)

	//We can get back a list of users if registered
	@UseBefore(authenticateToken)
	@Get('/users')
    async all() {
		//if registered
			//return all users
			return this.userRepository.find()


    }

	//We can retrieve a specific user by their ID
	@UseBefore(authenticateToken)
	@Get('/users/:id')
	async one(@Param('id') id :number) {
		//we are registered
			// we can find  a user by their ID
			const user = await this.userRepository.findOne({
				where: {id}
			})

			//if that id doesnt exist, the user doesnt exist
			if (!user) {
				return 'unregistered user'
			}
			//else return that user
			return user
		}




	// create an account for users
	@Post('/users')
	async save(@Body() bodyUser: User, @Res() response: Response) {

			response.statusCode = 201 //Created
			return this.userRepository.save(bodyUser)

	}

	//Anyone can delete their account
	@Delete('/users/:id')
	async remove(@Param('id') id:number) {
    	//find the user to delete
    	const userToRemove = await this.userRepository.findOneBy({id})

			//if that user doesnt exist
    	if (!userToRemove) {
    		return 'this user not exist'
    	}

		//else they are deleted
    	await this.userRepository.remove(userToRemove)
    	return 'user has been removed'


	}


	//We can update a users info if we are admin
	@UseBefore(authenticateToken)
	@Put('/users/:id')
	async update(@Param('id') id: number, @Body() updateUserData: User, @Res() response: Response) {
		//if admin
			//search for the specified user
			const existingUser = await this.userRepository.findOneBy({id});

			//if they dont exist
			if (!existingUser) {
				return 'this user does not exist';
			}

			//else
			// Update the existing user's properties with the new data
			existingUser.screenName = updateUserData.screenName;
			existingUser.age = updateUserData.age;
			existingUser.accessLevel = updateUserData.accessLevel;



			// Save the updated user
			const updatedUser = await this.userRepository.save(existingUser);

			response.status(200); // OK
			return updatedUser;
		}

		//A user could change their name
	@Put('/users/name/:id')
	async name(@Param('id') id: number, @Body() updateUserData: Partial<User>, @Res() response: Response){

		// search for the specified user
		const existingUser = await this.userRepository.findOneBy({ id });


		// if they don't exist
		if (!existingUser) {
			return 'this user does not exist';
		}


			// else
			// Update the existing user's properties with the new data
			if (updateUserData.screenName !== undefined) {
				existingUser.screenName = updateUserData.screenName;
			}



		// Save the updated user
		const updatedUser = await this.userRepository.save(existingUser);

		response.status(200); // OK
		return updatedUser;
	}



	// Anyone can login.. if they have an account
	@Post('/login')
	async login(@Body() loginData: { screenName: string }, @Res() response: Response) {
		try {
			// find the users screen name in the database
			const user = await this.userRepository.findOne({ where: { screenName: loginData.screenName } });

			// if they dont exist return 401
			if (!user) {
				return response.status(401).json({ error: 'Invalid screenName' });
			}

			// Generate token based on user's access level
			const token = user.accessLevel === 'admin'
				? AuthService.generateAdminToken()
				: AuthService.generateBasicToken();

			// Attach the token to the user
			user.token = token;


			// Save the updated user
			await this.userRepository.save(user);

			// Respond with the token

			return response.status(200).json({ token, screenName: user.screenName, accessLevel: user.accessLevel, id: user.id });
		} catch (error) {
			console.error('Login error:', error);
			return response.status(500).json({ error: 'Internal Server Error' });
		}
	}

}
