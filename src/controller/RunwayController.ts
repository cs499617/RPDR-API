/**
 * The purpose of this file is to create the Runway Controller. Here it is defined how a user can modify a Runway in our DB
 */
//Imports for what we will use in this file
/* eslint-disable no-mixed-spaces-and-tabs */
import {Request, Response} from 'express'
import {AppDataSource} from '../data-source'
import {JsonController, Get, Param, Post, Res, Delete, Body, Put, UseBefore, Req} from 'routing-controllers'
//Importing my own entities
import {Runway} from "../entity/Runway";
import {authenticateToken} from "../services/AuthMiddleware";

@JsonController()
export default class RunwayController {

    private runwayRepository = AppDataSource.getRepository(Runway)

    @UseBefore(authenticateToken)//Users can get a list of runways
    @Get('/runways')
    async all() {
        //user is registered
            //return a list of runways
            return this.runwayRepository.find()
        }



    @UseBefore(authenticateToken)
    @Get('/runways/:id')//Users can search for a specific runway look
    async one(@Param('id') id :number) {
        //user is registered
            //find that runway by its ID
            const runway = await this.runwayRepository.findOne({
                where: {id}
            })

            //If it doesnt exist
            if (!runway) {
                return 'unregistered runway look'
            }
            //else return the runway
            return runway
    }

    @UseBefore(authenticateToken)//An admin can create a new runway look for a queen
    @Post('/runways')
    async save(@Body() bodyRunway: Runway, @Res() response: Response) {
            response.statusCode = 201 //Created
            return this.runwayRepository.save(bodyRunway)

    }

    @UseBefore(authenticateToken) //An admin can delete a runway look
    @Delete('/runways/:id')
    async remove(@Param('id') id:number ) {
        //they are admin
        //look for the runway by its ID
        const runwayToRemove = await this.runwayRepository.findOneBy({id})

            //if it doesnt exist
        if (!runwayToRemove) {
            return 'this runway look does not exist'
        }

        //else it exists and can be deleted
        await this.runwayRepository.remove(runwayToRemove)
        return 'runway look has been removed'
    }

    @Put('/runways/:id/votes')
    async vote(@Param('id') id: number, @Body() voteData: { votes: number }, @Res() response: Response, @Req() request: Request) {
        try {
            const givenToken = request.header('Authorization')?.replace('Bearer ', '');
            const existingRunway = await this.runwayRepository.findOneBy({ id });

            if (!existingRunway) {
                return response.status(404).json({ error: 'Runway not found' });
            }

            // Check if the user has the basic user access level
            if (givenToken === 'basic_token' || givenToken === 'admin_token') {
                // Allow basic users to vote only if the vote is 1 or -1
                if (voteData.votes !== undefined && (voteData.votes === 1 || voteData.votes === -1)) {
                    existingRunway.votes = Math.max(0, existingRunway.votes + voteData.votes);

                    const updatedRunway = await this.runwayRepository.save(existingRunway);

                    return response.status(200).json(updatedRunway);
                } else {
                    return response.status(400).json({ error: 'Bad Request: Invalid vote value for basic user' });
                }
            } else {
                // If non-basic user tries to vote
                throw new Error('Unauthorized: Invalid Bearer token or insufficient privileges');
            }
        } catch (error) {
            console.error('Error in vote method:', error);
            return response.status(500).json({ error: 'Internal Server Error' });
        }
    }

    @UseBefore(authenticateToken)
    @Put('/runways/:id')
    async update(@Param('id') id: number, @Body() updatedRunwayData: Runway, @Res() response: Response, @Req() request: Request) {
        try {
            const givenToken = request.header('Authorization')?.replace('Bearer ', '');
            const existingRunway = await this.runwayRepository.findOneBy({ id });

            if (!existingRunway) {
                return response.status(404).json({ error: 'Runway not found' });
            }

            // Check if the user has the admin access level
            if (givenToken === 'admin_token') {
                // Allow admin users to update properties
                existingRunway.season = updatedRunwayData.season;
                existingRunway.episode = updatedRunwayData.episode;
                existingRunway.year = updatedRunwayData.year;
                existingRunway.imagePath = updatedRunwayData.imagePath;
                existingRunway.won = updatedRunwayData.won;

                // Update votes ensuring it's not below 0
                if (updatedRunwayData.votes !== undefined && updatedRunwayData.votes !== 0) {
                    existingRunway.votes = Math.max(0, existingRunway.votes + (updatedRunwayData.votes === 1 ? 1 : -1));
                }

                // If 'queen' is present in the update data, set it separately
                if (updatedRunwayData.queen) {
                    existingRunway.queen = updatedRunwayData.queen;
                }

                // Save the updated queen
                const updatedRunway = await this.runwayRepository.save(existingRunway);

                return response.status(200).json(updatedRunway);
            } else if (givenToken === 'basic_token') {
                // Allow basic users to vote only if the vote is 1 or -1
                if (updatedRunwayData.votes !== undefined && (updatedRunwayData.votes === 1 || updatedRunwayData.votes === -1)) {
                    existingRunway.votes = Math.max(0, existingRunway.votes + updatedRunwayData.votes);
                    const updatedRunway = await this.runwayRepository.save(existingRunway);

                    return response.status(200).json(updatedRunway);
                } else if (updatedRunwayData.votes === 0) {
                    // If the vote is 0, don't do anything
                    return response.status(200).json(existingRunway);
                } else {
                    return response.status(400).json({ error: 'Bad Request: Invalid vote value for basic user' });
                }
            } else {
                // If non-admin tries to update
                throw new Error('Unauthorized: Invalid Bearer token');
            }
        } catch (error) {
            console.error('Error in update method:', error);
            return response.status(500).json({ error: 'Internal Server Error' });
        }




    }



}
