/**
 * The purpose of this file is to create the Queen Controller.
 * Here it is defined how a user can modify a Queen in our DB
 */
//Imports for what we will use in this file
/* eslint-disable no-mixed-spaces-and-tabs */
import {AppDataSource} from '../data-source'
import {NextFunction, Request, Response} from 'express'
import {JsonController, Get, Param, Post, Res, Delete, Body, Put, Req, UseBefore} from 'routing-controllers'
//Importing my own entities
import {Queen} from "../entity/Queen";
import {authenticateToken} from "../services/AuthMiddleware";
import {validate, ValidationError} from "class-validator";



@JsonController()
export class QueenController {
    private queenRepository = AppDataSource.getRepository(Queen)


    //A user who is registered will be able to see a list of all queens.
    @UseBefore(authenticateToken) //Check for a token (this means a user is registered)
    @Get('/queens')
    async all(@Res() response: Response, @Req() request: Request) {
           // if so they can see the queens
                return this.queenRepository.find({relations: ['runways']});

    }

    //A user who is registered will be able to search for a specific queen by their id

    @UseBefore(authenticateToken)  //Check for a token (this means a user is registered)
    @Get('/queens/:id')
    async one(@Param('id') id :number) {
            //Get the queen by their ID
        const queen = await this.queenRepository.findOne({
            where: {id}, relations: ['runways']
        })
            //Handle invalid ID's
        if (!queen) {
            return 'this queen doesn\'t exist in the database'
        }
        //If ID valid, give the user that queen
        return queen

    }


    @UseBefore(authenticateToken) //An admin can create a queen
    @Post('/queens')
    async save( @Body() bodyQueen: Queen, @Res() response: Response,) {
            response.statusCode = 201 //Created
            return this.queenRepository.save(bodyQueen)
    }


    @UseBefore(authenticateToken) //An admin can delete a queen
    @Delete('/queens/:id')
    async remove(@Param('id') id:number) {
        //they are an admin
            //search for the queen's ID
            const queenToRemove = await this.queenRepository.findOneBy({id})
            //If no such queen exists
            if (!queenToRemove) {
                return 'this queen does not exist'
            }
            //Else the queen should be removed
            await this.queenRepository.remove(queenToRemove)
            return 'queen has been removed'
    }

   @UseBefore(authenticateToken)//An admin can update a queens info
    @Put('/queens/:id')
    async update(@Param('id') id: number,  @Body() updatedQueenData: Queen, @Res() response: Response) {
        //they are admin
            //Find the queen by ID
        const existingQueen = await this.queenRepository.findOneBy({id});

        //If that ID doesnt exist (queen doesnt exist)
        if (!existingQueen) {
            return 'this queen does not exist';
        }



        // Update the existing queen's properties with the new data
        existingQueen.queenName = updatedQueenData.queenName;
        existingQueen.birthYear = updatedQueenData.birthYear;
        existingQueen.city = updatedQueenData.city;
        existingQueen.state = updatedQueenData.state;
        //existingQueen.runways = updatedQueenData.runways;

        // Update the existing queen's properties with the new data
        Object.assign(existingQueen, updatedQueenData);

        // Save the updated queen
        const updatedQueen = await this.queenRepository.save(existingQueen);

        response.status(200); // OK
        return updatedQueen;
    }

}
