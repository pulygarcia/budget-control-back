import { db } from "../config/database";
import {exit} from 'node:process'

const clearTestDB = async () => {
    try {
        await db.sync({force: true});//clean database
        console.log('data has been cleaned');

        exit();
    } catch (error) {
        console.log(error);
    }
}

if(process.argv[2] === '--clearDb'){
    clearTestDB();
}