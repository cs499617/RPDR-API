/**
 * The purpose of this file is to create the Queen object. Here it is defined what a Queen can/must be for
 * our API.
 */
//Imports for what we will use in this file
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
import {IsInt, IsString, Length, Matches, Max, Min,} from 'class-validator'
//My own entity that defines a Runway
import {Runway} from "./Runway";



@Entity()
export class Queen {
    //An auto generated ID, this makes it so that each queen is uniquely identified in our DB
    @PrimaryGeneratedColumn()
    id: number;

    //A queen will have:
    // a name
    @Column({ type: 'varchar', length: 150 })
    @IsString( {message: 'A queens name is a string data type'})
    @Length(1, 150, { message: 'A queen\'s name must be from $constraint1 to $constraint2 characters' })
    queenName: string;

    //birth year
    @Column({ type: 'int' , nullable:true})
    @IsInt({ message: 'The year must be an integer' })
    @Min(1900, { message: 'The year must be greater than or equal to $constraint1' })
    @Max(2005, { message: 'The year must be less than or equal to $constraint1' })
    birthYear: number;

    //their city
    @Column({ type: 'varchar', length: 150 })
    @IsString( {message: 'A queens city is a string data type'})
    @Length(1, 150, { message: 'A queen\'s city must be from $constraint1 to $constraint2 characters' })
    city: string;

    //their state
    @Column({ type: 'varchar', length: 150 })
    @IsString( {message: 'A queens state is a string data type'})
    @Length(1, 150, { message: 'A queen\'s state must be from $constraint1 to $constraint2 characters' })
    state: string;

    //their icon/image
    @Column({ type: 'varchar' })
    @IsString({ message: 'File path must be a string' })
    @Matches(/^images\/[a-zA-Z0-9-]+(?:\/[a-zA-Z0-9-]+)*\/[a-zA-Z0-9-]+\.(png|jpg|jpeg)$/, {message: 'File path must be in the form of: images/your-queen-name/icon.png'})
    imagePath: string;

    //Make a relationship for Runway to Queen
    @OneToMany(() => Runway, (runway) => runway.queen)
    runways: Runway[];

}
