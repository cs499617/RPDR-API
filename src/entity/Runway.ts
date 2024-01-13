/**
 * The purpose of this file is to create the Runway object. Here it is defined what a Runway can/must be for
 * our API.
 */
//Imports for what we will use in this file
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm'
import {
    IsBoolean,
    IsInt,
    IsString,
    Matches,
    Max,
    Min
} from 'class-validator'
//My own entity that defines a Queen
import {Queen} from "./Queen";


@Entity()
export class Runway {
    //An auto generated ID, this makes it so that each runway is uniquely identified in our DB
    @PrimaryGeneratedColumn()
    id: number;

    //A runway is defined by:

    //The season it aired.
    @Column({ type: 'int' })
    @IsInt({ message: 'The season must be an integer' })
    @Min(1, { message: 'The first season is $constraint1' })
    @Max(15, { message: 'The latest season is $constraint1' })
    season: number;

    //The episodes it aired.
    @Column({ type: 'int' })
    @IsInt({ message: 'The episode must be an integer' })
    @Min(1, { message: 'Min episodes per season is $constraint1' })
    @Max(15, { message: 'Max episodes per season is $constraint1' })
    episode: number;

    //The year of that episode/season
    @Column({ type: 'int' })
    @IsInt({ message: 'The year must be an integer' })
    @Min(2008, { message: 'The year must be greater than or equal to $constraint1' })
    @Max(2023, { message: 'The year must be less than or equal to $constraint1' })
    year: number;

    //Its image path
    @Column({ type: 'varchar' })
    @IsString({ message: 'File path must be a string' })
    @Matches(/^images\/[a-zA-Z0-9-]+(?:\/[a-zA-Z0-9-]+)*\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.(png|jpg|jpeg)$/, { message: 'File path must be in the form of: images/your-queen-name/runways/s1ep1.png' })
    imagePath: string;

    //The votes users have given it
    @Column({ type: 'int' })
    @IsInt( { message: 'Votes must be a number' })
    @Min(-1, { message: 'Votes cannot be negative' }) //I've set this up to -1 so that users can take away a vote
    @Max(1000000, { message: 'Votes cannot exceed $constraint1' })
    votes: number;

    //If it won its challenge
    @Column({ type: 'boolean' })
    @IsBoolean({ message: 'Win status must be a boolean value' })
    won: boolean;


    //The runway must create a relationship to the queen entity
    @ManyToOne(() => Queen, (queen) => queen.runways)
    queen: Queen;




}
