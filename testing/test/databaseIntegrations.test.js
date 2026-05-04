/* The test modules to set up tests */
import { test, after } from 'node:test';
import { Readable } from 'node:stream';
import assert from 'node:assert';
import bcrypt from 'bcrypt';

/* The functions to unit test */
import { queryFollowUser } from '../../server/serverQueries.js';
import { registerUserToDB, loginUser, getLoginSession, logout, parseJSON, editUser } from "../../server/router-APIs/authentication.js";
import { setUserPreferences } from "../../server/router-APIs/userPreferences.js"
import { query, pool } from '../../database/pool.js';
import { login } from '../../frontend/js/loginRegister.js';

/* After the tests close all connections and allow Node to exit, so we can get the report */
after(() => { pool.end(); });

/* -------------- Unit database integration tests (x) -------------- */

/* (test 1) Make a login with credentials for existing user (admin user) */

test('loginUser Function: Succesful login from admin credentials', async () => {
  // SETUP: Test credentials (the admin account always exists in the database)
  const TEST_EMAIL = "admin", TEST_PASS = "123", TEST_ID = 1;

  // Execute: run the login function
  const mockObject = await loginTestAccount(TEST_EMAIL, TEST_PASS, TEST_ID);

  // Verify: response.status = 200 and the session exists in DB
  assert.strictEqual(mockObject.responseData.status, 200, "Status code must be 200");

  const [session] = await query("SELECT * FROM sessions WHERE user_id = ?", [TEST_ID]);
  assert.ok(session, "Must exist a session in database");
  assert.strictEqual(session.user_id, TEST_ID, "... which belongs to correct user");
});

/* (test 2) 'followUser' function (without the server running)*/
const ACTIVE_USER = 1, TARGET_USER = 2;

test('followUser Database Integration Test', async () => {
  // Setup: the database to ensure the data to insert does not already exist
  await query("DELETE FROM user_relations WHERE user_id = ? AND target_user_id = ?", [ACTIVE_USER, TARGET_USER]);

  // Execute: the server entry for the follow a user endpoint on frontend
  const queryRes = await queryFollowUser(TARGET_USER, ACTIVE_USER);

  // Verify: the row now exists in db
  const rows = await query("SELECT * FROM user_relations WHERE user_id = ? AND target_user_id = ?", [ACTIVE_USER, TARGET_USER])
  assert.strictEqual(rows.length, 1, "The row should exist in the database");
});

/* (test 3) set the preferences for a user with existing preferences (the admin user)*/
test('setUserPreferences updates the user preferences for test user to an array of prefs', async () => {
  const TEST_ID = 1, testPrefList = ["Sightseeing", "Nightlife", "Beaches"]
  //Setup: the values to insert, which are different from the default migrated (skiing) for the admin user
  const requestBody = {
    user_id: TEST_ID,
    preferenceList: testPrefList
  }
  //mock the HTTP request and result object
  const mockObject = mockReqRes(requestBody);

  //Execute: "send the request" to the function
  await setUserPreferences(mockObject.req, mockObject.res);

  //Verify: the status code is 200 and the preferencelist set for the user is now equal to the test list set
  assert.strictEqual(mockObject.responseData.status, 200, "Status code must be 200");

  const session = await query("SELECT preference_id FROM user_prefs WHERE user_id = ?", [TEST_ID])
  //Sort the lists same way, as the query does not guarantee same order of array as the test list. Logically, they must be equal as sets, order does not matter.
  session.sort();
  testPrefList.sort();

  for (let i = 0; i < session.length; i++) {
    assert.strictEqual(session[i].preference_id, testPrefList[i], "Preferences must match exactly to the test list");
  }
});

/* -------- Helper functions for the test functions -------- */
function mockReqRes(requestObject) {
  // Create an object to hold the request and result
  let responseData = { headers: {}, status: null, body: null };

  const req = Readable.from([JSON.stringify(requestObject)]);
  req.headers = { 'content-type': 'application/json' };

  const res = {
    writeHead: (status) => { responseData.status = status; },
    setHeader: (name, value) => { responseData.headers[name] = value; },
    end: (data) => {
      if (data) {
        try {
          responseData.body = JSON.parse(data);
        } catch (e) {
          responseData.body = data;
        }
      }
    }
  };

  return { req, res, responseData };
}

async function loginTestAccount(TEST_EMAIL, TEST_PASS, TEST_ID) {
  await query("DELETE FROM sessions WHERE user_id = ?", [TEST_ID]);

  // Setup: Mock request as a readable stream (Readable.from), like a real request
  const mockObject = mockReqRes({ email: TEST_EMAIL, password: TEST_PASS });

  // Execute: send the mocked req res to loginUser function
  await loginUser(mockObject.req, mockObject.res);
  assert.ok(mockObject.res, 'The login setup for editUser() test was unsuccesful');

  return mockObject;
}
