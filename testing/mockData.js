import { query } from "../database/pool.js";
import { faker } from '@faker-js/faker';
export async function mockUsers(amount) {
    let mockUsers = [];
    for (let i = 0; i < amount; i++) {
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
}