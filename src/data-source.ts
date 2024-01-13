import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { Queen } from './entity/Queen'
import {Runway} from "./entity/Runway";

export const AppDataSource = new DataSource({
	type: 'better-sqlite3',
	database: 'sqlite.db',
	synchronize: true,
	logging: false,
	entities: [User, Queen, Runway],
	migrations: [],
	subscribers: [],
})
