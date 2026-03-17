import { query } from "../database/pool.js";
import { faker } from '@faker-js/faker';

export async function mockUserPreferences(amount){
    let result = await query(`SELECT * FROM preferences`);
    let n = result.length;

    let mockUserPreferences = [];
    for (let i=1; i <= amount; i++) {
        for (let j=0; j < n; j++) {
            if (Math.random < 0.5) { continue; }
            let preference = [i, result[j][`preference_id`], 1];
            mockUserPreferences.push(preference);
        }
    }
    
    await query(
        `INSERT INTO user_prefs (user_id, preference_id, preference_value) VALUES ?`,
        [mockUserPreferences]
    );
    
    console.log(`✓ Mocked preferences for ${amount} of users`);
}

export async function mockUsers(amount){
    let mockUsers = [];
    for (let i=0; i < amount; i++) {
        let gender = faker.person.sexType()
        let user = [
            faker.person.firstName(gender), 
            faker.person.lastName(), 
            faker.internet.email(), 
            faker.internet.password(), 
            faker.location.countryCode(), 
            gender, 
            Math.floor(Math.random() * 82) + 18,
            faker.person.bio(), 
            null
        ];
        mockUsers.push(user);
    }

    await query(
        `INSERT INTO users (name_first, name_last, email, password_hash, country, gender, age, bio, picture) VALUES ?`,
        [mockUsers]
    );

    console.log(`✓ Mocked ${amount} of users`);
    await mockUserPreferences(amount);
}

