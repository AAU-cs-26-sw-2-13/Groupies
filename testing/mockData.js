import { query } from "../database/pool.js";
import { faker } from '@faker-js/faker';
import path from "path"
import fs from "fs";
const uploads = path.join(process.cwd(), "database", "uploads");

const MIN_PREFERENCES = 1; // Constraint on minimum amount of preferences mocked per user
const MIN_TAGS = 1; // Constraint on minimum amount of tags mocked per group

function genNumber(min, max) { // Returns random number within range
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date) { // Returns YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    return date.toISOString().slice(0, 13).replace('T', ' ') + ':00:00'; // Remove T & Z from iso, and make it end in :00
}

function dateNow() { // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    return formatDate(new Date(Date.now()));
}

function dateDayDiff(date1, date2) { // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    let dateDiffDays = Math.round(Math.abs(date1 - date2) / 86400000); // Difference in dates, divided by 86.4 million miliseconds (1 day)
    return dateDiffDays;
}

function genMockActivityDateTimePair(startDate, n) { // Returns YYYY-MM-DD HH:MI:SS with days progressed from startdate and random hour
    let date1 = new Date(startDate);
    date1.setDate(date1.getDate() + n);
    date1.setHours(genNumber(6, 23), 0, 0, 0);
    let date2 = new Date(date1);
    date2.setHours(date2.getHours() + genNumber(1, 12));
    return { startDate: formatDate(date1), endDate: formatDate(date2) };
}

function genMockDateTimePair() { // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    const past = faker.date.past({years: 5}); // Past date, 5 yr max
    const future = faker.date.future({years: 5}); // Future date, 5 yr max
    const date1 = faker.date.between({from: past, to: future});
    const date2 = faker.date.soon({ days: 60, refDate: date1 }); // 60 days max after date1
    return { startDate: formatDate(date1), endDate: formatDate(date2) };
}

function genAge(min,max) { // Returns 2x YYYY-MM-DD HH:MI:SS formatted datetime for SQL
    let now = new Date();
    now.setFullYear(now.getFullYear() - min);
    return formatDate(faker.date.past({years: min, refDate: now}));
}

async function mockUserPreferences(userAmount) {
    const prefDictionary = await query(`SELECT * FROM preferences`);
    const prefAmount = prefDictionary.length;

    let preferences = [];
    for (let i = 1; i <= userAmount; i++) {
        let prefCount = 0;
        for (let j = 0; j < prefAmount; j++) {
            if (Math.random() < 0.5) { continue; }
            const preference = [i, prefDictionary[j][`preference_id`], 1];
            preferences.push([i, prefDictionary[j][`preference_id`], 1]);
            prefCount++;
        }
        if (prefCount < MIN_PREFERENCES) {
            while (prefCount < MIN_PREFERENCES) {
                let k = genNumber(0, prefAmount - 1)
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

async function mockUserRelations(userAmount) {
    const relations = [];
    for (let i = 1; i <= userAmount; i++) {
        for (let j = 1; j <= userAmount; j++) {
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

async function mockGroupActivities() {
    const groups = await query(`SELECT id,host_user_id,date_start_at,date_end_at FROM \`groups\``);
    const groupRelations = await query(`SELECT user_id,group_id,member FROM group_relations`);

    let activities = [];
    for (let i = 0; i < groups.length; i++) {
        let tripDayAmount = dateDayDiff(groups[i].date_start_at, groups[i].date_end_at) + 1 // Amount of days the trip spans over, +1 is including start date
        const groupId = groups[i].id
        const userIds = groupRelations.filter(rel => rel.group_id === groupId && rel.member[0] === 1).map(rel => rel.user_id); // Filters users whom are member of the trip and maps to {user_id[0],...,user_id[n]} - rel.member[0] === 1, because SQL bits are returned as a buffer array so the value is stored as index 0
        for (let j = 0; j < tripDayAmount; j++) {
            if (genNumber(1, 3) === 1) { continue; }
            const mockDates = genMockActivityDateTimePair(groups[i].date_start_at, j);
            const activity = [
                userIds[genNumber(0, userIds.length - 1)],
                groupId,
                faker.lorem.words({ min: 1, max: 5 }), // min/max is amount of lorem ipsum words to mock
                faker.lorem.words({ min: 15, max: 20 }), // min/max is amount of lorem ipsum words to mock
                mockDates.startDate,
                mockDates.endDate,
            ];
            activities.push(activity);
        }
    }

    await query(
        `INSERT INTO group_activities (user_id, group_id, title, about, date_start_at, date_end_at) VALUES ?`,
        [activities]
    );

    console.log(`✓ Mocked ${activities.length} groups activities`);
}

async function mockGroupRelations() {
    const preferences = await query(`SELECT user_id,preference_id FROM user_prefs`);
    const groups = await query(`SELECT id,host_user_id,max_members FROM \`groups\``);
    const groupTags = await query(`SELECT group_id,tag_id FROM group_tags`);

    let relations = [];
    for (let i = 0; i < groups.length; i++) {
        const groupId = groups[i][`id`]
        const tags = groupTags.filter(tag => tag.group_id === groupId).map(tag => tag.tag_id); // Filters used tags for group and maps to {tag_id[0],...,tag_id[n]}
        const userIds = preferences.filter(pref => tags.includes(pref.preference_id)).map(pref => pref.user_id); // Filters users whom share at least 1 tag and maps to {user_id[0],...,user_id[n]}

        relations.push([groups[i][`host_user_id`], groupId, 1, 1, 1, dateNow()]) // Add the host
        let memberCount = 1; // Host
        let goalMemberCount = genNumber(2, groups[i][`max_members`]);
        let attempts = 0; // Prevent not enough eligible users in the set
        while (memberCount < goalMemberCount && attempts < 100) {
            attempts++;
            const userId = userIds[genNumber(0, userIds.length - 1)]  // Select a random user with at least 1 preference matching the group tags
            if (relations.some(r => r[1] === groupId && r[0] === userId)) { continue; }
            const member = genNumber(1, 3) === 1 ? 1 : 0; // Roll a chance to be member, if number is within parameter use 1 else 0
            const follower = member === 1 ? 1 : (genNumber(1, 3) === 1 ? 1 : 0);  // If member then follow, else roll a chance to follow
            if (!member && !follower) { continue; }
            const relation = [
                userId,
                groupId,
                follower,  // If member then follow, else roll a chance to follow
                member,
                0, // Not organizer
                dateNow()
            ];
            relations.push(relation);
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
    for (let i = 0; i < groups.length; i++) {
        const groupId = groups[i][`id`]
        const hostId = groups[i][`host_user_id`]
        let tagAmount = 0;
        for (let j = 0; j < prefAmount; j++) {
            const k = genNumber(0, prefAmount - 1)
            if (!preferences.some(pref => pref.user_id === hostId && pref.preference_id === prefDictionary[k].preference_id)) { continue; }
            if (tags.some(pref => pref[0] == groupId && pref[1] == prefDictionary[k].preference_id)) { continue; }
            if (Math.random() < 0.25) { continue; }
            tags.push([groupId, prefDictionary[k][`preference_id`], 1]);
            tagAmount++;
        }
        while (tagAmount < MIN_TAGS) {
            const k = genNumber(0, prefAmount - 1)
            if (!preferences.some(pref => pref.user_id === hostId && pref.preference_id === prefDictionary[k].preference_id)) { continue; }
            if (tags.some(pref => pref[0] == groupId && pref[1] == prefDictionary[k].preference_id)) { continue; }
            tags.push([groupId, prefDictionary[k][`preference_id`], 1]);
            tagAmount++;
        }
    }

    await query(
        `INSERT INTO group_tags (group_id, tag_id, tag_value) VALUES ?`,
        [tags]
    );

    console.log(`✓ Mocked ${tags.length} groups tags`);
}

async function mockGroups(userAmount) {
    const groupAmount = genNumber(userAmount / 10, userAmount / 5);

    let groups = [];
    for (let i = 0; i < groupAmount; i++) {
        const files = fs.readdirSync(path.join(uploads, "images", "groupPictures"))
        const img = files[Math.floor(Math.random() * files.length)]
        const mockDates = genMockDateTimePair();
        const year = mockDates.startDate.slice(0, 4);
        const country = faker.location.country();
        const city = faker.location.city();
        const group = [
            genNumber(1, userAmount),
            country + ', ' + city + ' - ' + year,
            country + ', ' + city,
            faker.lorem.words({ min: 25, max: 100 }), // min/max is amount of lorem ipsum words to mock
            mockDates.startDate,
            mockDates.endDate,
            genNumber(2, 10), // Random amount of max members
            path.join("/", "images", "groupPictures", img)
        ];
        groups.push(group);
    }

    await query(
        `INSERT INTO \`groups\` (host_user_id, title, destination, about, date_start_at, date_end_at, max_members, picture) VALUES ?`,
        [groups]
    );

    console.log(`✓ Mocked ${groups.length} groups`);
}

export async function mockUsers(userAmount) {
    let users = [];
    for (let i = 0; i < userAmount - 1; i++) { // i-1 because of permanent test user
        const gender = faker.person.sexType()
        const user = [
            faker.person.firstName(gender),
            faker.person.lastName(),
            faker.internet.email(),
            faker.internet.password(),
            faker.location.countryCode(),
            gender,
            await genAge(18, 70),
            faker.person.bio(),
            faker.image.personPortrait({ sex: gender, size: '128' })
        ];
        users.push(user);
    }

    await query(
        `INSERT INTO users (name_first, name_last, email, password_hash, country, gender, dob, bio, picture) VALUES ?`,
        [users]
    );

    console.log(`✓ Mocked ${userAmount} users`);
    await mockUserPreferences(userAmount);
    await mockUserRelations(userAmount);
    await mockGroups(userAmount);
    await mockGroupTags();
    await mockGroupRelations();
    await mockGroupActivities();
}

