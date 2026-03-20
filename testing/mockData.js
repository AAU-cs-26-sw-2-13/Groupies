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

function dateNow(){ // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    return formatDate(new Date(Date.now()));
}

function genMockDateTimePair(){ // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    const date1 = faker.date.future({ years: 5 }); // Future date, 5 yr max
    const date2 = faker.date.soon({ days: 60, refDate: date1 }); // 60 days max after date1
    return { startDate: formatDate(date1), endDate: formatDate(date2) };
}

async function mockUserPreferences(userAmount){
    const prefDictionary = await query(`SELECT * FROM preferences`);
    const prefAmount = prefDictionary.length;

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
    const relations = [];
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

async function mockGroupRelations() {
    const preferences = await query(`SELECT user_id,preference_id FROM user_prefs`);
    const groups = await query(`SELECT id,host_user_id,max_members FROM \`groups\``);
    const groupTags = await query(`SELECT group_id,tag_id FROM group_tags`);
    const prefDictionary = await query(`SELECT * FROM preferences`);
    const prefAmount = prefDictionary.length;
    
    let relations = [];
    for (let i=1; i < groups.length-1; i++) { // Select a random user with at least 1 preference matching the group tags
        const tags = groupTags.filter(tag => tag.group_id === i).map(tag => tag.tag_id); // Filters used tags for group and maps to {tag_id[0],...,tag_id[n]}
        const userIds = preferences.filter(pref => tags.includes(pref.preference_id)).map(pref => pref.user_id); // Filters users whom share at least 1 tag and maps to {user_id[0],...,user_id[n]}
        
        relations.push([groups[i][`host_user_id`],i,1,1,1,dateNow()]) // Add the host
        let memberCount = 1; // Host
        let goalMemberCount = genNumber(1,groups[i][`max_members`]);
        let attempts = 0; // Prevent not enough eligible users in the set
        while (memberCount < goalMemberCount && attempts < 100) {
            attempts++;
            const userId = userIds[genNumber(0,userIds.length-1)]
            if (relations.some(r => r[1] === i && r[0] === userId)) { continue; }
            const member = genNumber(1, 3) === 1 ? 1 : 0; // If number is within parameter use 1 else 0
            const follower = member === 1 ? 1 : (genNumber(1, 3) === 1 ? 1 : 0);  // If member then follow, else roll a chance to follow
            if (!member && !follower) { continue; }
            const relation = [
                userId,
                i,
                follower,  // If member then follow, else roll a chance to follow
                member,
                0, // Not organizer
                dateNow()
            ]
            relations.push(relation)
            if (member === 1) { memberCount++; }
        }
    }

    await query(
        `INSERT INTO group_relations (user_id, group_id, follower, member, organizer, member_at) VALUES ?`,
        [relations]
    );
    
    console.log(`✓ Mocked ${relations.length} groups relations`);
}

async function mockGroupTags() {
    const preferences = await query(`SELECT user_id,preference_id FROM user_prefs`);
    const groups = await query(`SELECT id,host_user_id FROM \`groups\``);
    const prefDictionary = await query(`SELECT * FROM preferences`);
    const prefAmount = prefDictionary.length;

    let tags = [];
    for (let i=1; i < groups.length-1; i++) {
        const hostId = groups[i][`host_user_id`]
        let tagAmount = 0;
        for (let j=0; j < prefAmount; j++) {
            const k = genNumber(0,prefAmount-1)
            if (!preferences.some(pref => pref.user_id === hostId && pref.preference_id === prefDictionary[k].preference_id)) { continue; }
            if (tags.some(pref => pref[0] == i && pref[1] == prefDictionary[k].preference_id)) { continue; }
            if (Math.random() < 0.25) { continue; }
            tags.push([i, prefDictionary[k][`preference_id`], 1]);
            tagAmount++;
        }
        while (tagAmount < MIN_TAGS) {
            const k = genNumber(0,prefAmount-1)
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
        const country = faker.location.country();
        const city = faker.location.city();
        const group = [
            genNumber(1,userAmount),
            country + ', ' + city + ' - ' + year,
            country + ', ' + city,
            faker.lorem.words({ min: 25, max: 100 }), // min/max is amount of lorem ipsum words to mock
            await mockDates.startDate,
            await mockDates.endDate,
            genNumber(2,10) // Random amount of max members
        ]
        groups.push(group);
    }

    await query(
        `INSERT INTO \`groups\` (host_user_id, title, destination, about, date_start_at, date_end_at, max_members) VALUES ?`,
        [groups]
    );
    
    console.log(`✓ Mocked ${groups.length} groups`);
}

export async function mockUsers(userAmount){
    let users = [];
    for (let i=0; i < userAmount; i++) {
        const gender = faker.person.sexType()
        const user = [
            faker.person.firstName(gender), 
            faker.person.lastName(), 
            faker.internet.email(), 
            faker.internet.password(), 
            faker.location.countryCode(), 
            gender, 
            await genNumber(18,70), // 18 to 100 years of age, consider changing age to date of birth instead?
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
    await mockGroupTags();
    await mockGroupRelations();
}

