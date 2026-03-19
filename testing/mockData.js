import { query } from "../database/pool.js";
import { faker } from '@faker-js/faker';

const MIN_PREFERENCES = 1; // Constraint on minimum amount of preferences mocked per user

async function genNumber(min,max){ // Returns random number within range
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function formatDate(date){ // Returns YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    return date.toISOString().slice(0, 13).replace('T',' ') + ':00:00'; // Remove T & Z from iso, and make it end in :00
}

async function genMockDateTimePair(){ // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    const date1 = faker.date.future({ years: 5 }); // Future date, 5 yr max
    const date2 = faker.date.soon({ days: 60, refDate: date1 }); // 60 days max after date1
    return { startDate: await formatDate(date1), endDate: await formatDate(date2) };
}

async function mockUserPreferences(amount){
    let result = await query(`SELECT * FROM preferences`);
    let n = result.length;

    let preferences = [];
    for (let i=1; i <= amount; i++) {
        let userAmount = 0;
        for (let j=0; j < n; j++) {
            if (Math.random() < 0.5) { continue; }
            const preference = [i, result[j][`preference_id`], 1];
            preferences.push(preference);
            userAmount++;
        }
        if (userAmount < MIN_PREFERENCES) {
            while (userAmount < MIN_PREFERENCES) {
                let k = await genNumber(0,n-1)
                if (preferences.includes([i, k, 1])) { continue; }
                const preference = [i, result[k][`preference_id`], 1];
                preferences.push(preference);
                userAmount++;
            }
        }
    }
    
    await query(
        `INSERT INTO user_prefs (user_id, preference_id, preference_value) VALUES ?`,
        [preferences]
    );
    
    console.log(`✓ Mocked ${preferences.length} user preferences`);
}

async function mockUserRelations(amount){
    let relations = [];
    for (let i=1; i <= amount; i++) {
        for (let j=1; j <= amount; j++) {
            if (Math.random() < 0.99) { continue; }
            const relation = [i, j, 1];
            relations.push(relation);
        }
    }
    
    await query(
        `INSERT INTO user_relations (user_id, target_user_id, follow_value) VALUES ?`,
        [relations]
    );
    
    console.log(`✓ Mocked ${relations.length} relations`);
}

async function mockGroups(amount){
    const groupAmount = await genNumber(amount / 10, amount / 5);

    let groups = [];
    for (let i=0; i < groupAmount; i++) {
        const mockDates = await genMockDateTimePair();
        const year = mockDates.startDate.slice(0,4);
        let country = faker.location.country();
        let city = faker.location.city();
        const group = [
            await genNumber(1,amount),
            country + ', ' + city + ' - ' + year,
            country + ', ' + city,
            faker.lorem.words({ min: 25, max: 100 }), // min/max is amount of lorem ipsum words to mock
            await mockDates.startDate,
            await mockDates.endDate,
        ]
        groups.push(group);
    }

    await query(
        `INSERT INTO \`groups\` (host_user_id, title, destination, about, date_start_at, date_end_at) VALUES ?`,
        [groups]
    );
    
    console.log(`✓ Mocked ${groups.length} groups`);
}

export async function mockUsers(amount){
    let users = [];
    for (let i=0; i < amount; i++) {
        let gender = faker.person.sexType()
        let user = [
            faker.person.firstName(gender), 
            faker.person.lastName(), 
            faker.internet.email(), 
            faker.internet.password(), 
            faker.location.countryCode(), 
            gender, 
            await genNumber(18,100), // 18 to 100 years of age, consider changing age to date of birth instead?
            faker.person.bio()
        ];
        users.push(user);
    }

    await query(
        `INSERT INTO users (name_first, name_last, email, password_hash, country, gender, age, bio) VALUES ?`,
        [users]
    );

    console.log(`✓ Mocked ${amount} users`);
    await mockUserPreferences(amount);
    await mockUserRelations(amount);
    await mockGroups(amount);
}

