/**
 * This is an auth middleware in order to ensure that admins and users duties are separate.
 */

import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { NextFunction, Request, Response } from 'express';

const userRepo = AppDataSource.getRepository(User);

//The method that will be exported
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {


    try {
       //check the headers bear token
        const givenToken = req.header('Authorization')?.replace('Bearer ', '');

        // user to check
        let user = new User();

        if (givenToken) { // if there is a token in the header

            //find a  user with that token in db
            user = await userRepo.findOneBy({ token: givenToken });


            if (!user) { //if no such user exists

                //notify
                return res.status(401).json({ error: 'Token does not exist' });
            }
        }
        // Attach the user to the request for later use
        req.user = user;

        if(user.accessLevel === "admin") //if our user is admin
        {

            // Allow access for all methods
            if (req.method === 'POST' || req.method === 'DELETE' || req.method === 'PUT' || req.method === 'GET') {

                return next();
            }
            else{
               //else throw an error
                return next({ status: 403, message: 'Unauthorized: Invalid Bearer token' });
            }
        }
        if(user.accessLevel === "basic") // if our user is basic
        {

            // Allow access for GET requests
            if (req.method === 'GET') {

                return next();
            }
            else{

                return next({ status: 403, message: 'Unauthorized: Invalid Bearer token' });
            }
        }

        next();
    } catch (error) {
        console.error('Error in authenticateToken middleware:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

