/**
 * The purpose of this file is to create the User object. Here it is defined what a user can/must be for
 * our API.
 */
//Imports for what we will use in this file
import {Entity, PrimaryGeneratedColumn, Column,  BeforeInsert} from 'typeorm'
import {IsIn, IsNotEmpty, IsString, Length, Max, Min} from 'class-validator'
//My own type script file that handles generating tokens.
import {AuthService} from "../services/AuthService";


@Entity()
export class User {

    //An auto generated ID, this makes it so that each user is uniquely identified in our DB
    @PrimaryGeneratedColumn()
    id: number

    //Screen name, this is a less unique version of a user name.
    @Column({type: 'varchar', length: 50})
    @IsNotEmpty({ message: 'Screen name is required' })
    @Length(1, 50, {message: 'Screen name must be from $constraint1 to $constraint2 characters'})
    screenName: string


    //We might want to restrict our demographic of users for several reasons by implementing an age
    @Column({type: 'integer', width: 3})
    @Min(13, {message: 'You must be $constraint1 to enter'})
    @Max(150, {message: 'You must be younger than $constraint1 to enter'})
    age: number

    //Different users will have different roles such as an admin vs basic user.
    @Column({type: 'varchar', length: 320})
    @IsString({message: 'Access level must be a string'})
    @IsIn(['basic', 'admin'], {message: 'Invalid access level'})
    accessLevel: string;

    //A token which is generated through my auth service.
    @Column({type: 'varchar', length: 320, default: '', nullable: true})
    token: string;

    @BeforeInsert()
    generateToken() {
        // Automatically generate a token for the user upon creation
        if (this.accessLevel === 'admin') {
            this.token = AuthService.generateAdminToken();
        } else {
            this.token = AuthService.generateBasicToken();
        }

    }

}
