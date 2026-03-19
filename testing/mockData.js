import { query } from "../database/pool.js";
import { faker } from '@faker-js/faker';

const MIN_PREFERENCES = 1; // Constraint on minimum amount of preferences mocked per user
const MIN_TAGS = 1; // Constraint on minimum amount of tags mocked per group

function genNumber(min,max){ // Returns random number within range
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date){ // Returns YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    return date.toISOString().slice(0, 13).replace('T',' ') + ':00:00'; // Remove T & Z from iso, and make it end in :00
}

function genMockDateTimePair(){ // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    const date1 = faker.date.future({ years: 5 }); // Future date, 5 yr max
    const date2 = faker.date.soon({ days: 60, refDate: date1 }); // 60 days max after date1
    return { startDate: formatDate(date1), endDate: formatDate(date2) };
}

async function mockUserPreferences(userAmount){
    let prefDictionary = await query(`SELECT * FROM preferences`);
    let prefAmount = prefDictionary.length;

    let preferences = [];
    for (let i=1; i <= userAmount; i++) {
        let prefCount = 0;
        for (let j=0; j < prefAmount; j++) {
            if (Math.random() < 0.5) { continue; }
            const preference = [i, prefDictionary[j][`preference_id`], 1];
            preferences.push([i, prefDictionary[j][`preference_id`], 1]);
            prefCount++;
        }
        if (prefCount < MIN_PREFERENCES) {
            while (prefCount < MIN_PREFERENCES) {
                let k = genNumber(0,prefAmount-1)
                if (preferences.includes([i, prefDictionary[k][`preference_id`], 1])) { continue; }
                preferences.push([i, prefDictionary[k][`preference_id`], 1]);
                prefCount++;
            }
        }
    }
    
    await query(
        `INSERT INTO user_prefs (user_id, preference_id, preference_value) VALUES ?`,
        [preferences]
    );
    
    console.log(`✓ Mocked ${preferences.length} user preferences`);
}

async function mockUserRelations(userAmount){
    let relations = [];
    for (let i=1; i <= userAmount; i++) {
        for (let j=1; j <= userAmount; j++) {
            if (Math.random() < 0.99) { continue; }
            relations.push([i, j, 1]);
        }
    }
    
    await query(
        `INSERT INTO user_relations (user_id, target_user_id, follow_value) VALUES ?`,
        [relations]
    );
    
    console.log(`✓ Mocked ${relations.length} relations`);
}

async function mockGroupRelations(){
    let preferences = await query(`SELECT user_id,preference_id FROM user_prefs`);
    let groups = await query(`SELECT id,host_user_id FROM \`groups\``);
    let prefDictionary = await query(`SELECT * FROM preferences`);
    let prefAmount = prefDictionary.length;

    let tags = [];
    for (let i=1; i < groups.length-1; i++) {
        let hostId = groups[i][`host_user_id`]
        let tagAmount = 0;
        for (let j=0; j < prefAmount; j++) {
            let k = genNumber(0,prefAmount-1)
            if (!preferences.some(pref => pref.user_id === hostId && pref.preference_id === prefDictionary[k].preference_id)) { continue; }
            if (tags.some(pref => pref[0] == i && pref[1] == prefDictionary[k].preference_id)) { continue; }
            if (Math.random() < 0.25) { continue; }
            tags.push([i, prefDictionary[k][`preference_id`], 1]);
            tagAmount++;
        }
        while (tagAmount < MIN_TAGS) {
            let k = genNumber(0,prefAmount-1)
            if (!preferences.some(pref => pref.user_id === hostId && pref.preference_id === prefDictionary[k].preference_id)) { continue; }
            if (tags.some(pref => pref[0] == i && pref[1] == prefDictionary[k].preference_id)) { continue; }
            tags.push([i, prefDictionary[k][`preference_id`], 1]);
            tagAmount++;
        }
    }

    await query(
        `INSERT INTO group_tags (group_id, tag_id, tag_value) VALUES ?`,
        [tags]
    );
    
    console.log(`✓ Mocked ${tags.length} groups tags`);
}

async function mockGroups(userAmount){
    const groupAmount = genNumber(userAmount / 10, userAmount / 5);

    let groups = [];
    for (let i=0; i < groupAmount; i++) {
        const mockDates = genMockDateTimePair();
        const year = mockDates.startDate.slice(0,4);
        let country = faker.location.country();
        let city = faker.location.city();
        const group = [
            genNumber(1,userAmount),
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

export async function mockUsers(userAmount){
    let users = [];
    for (let i=0; i < userAmount; i++) {
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

    console.log(`✓ Mocked ${userAmount} users`);
    await mockUserPreferences(userAmount);
    await mockUserRelations(userAmount);
    await mockGroups(userAmount);
    await mockGroupRelations();
}

