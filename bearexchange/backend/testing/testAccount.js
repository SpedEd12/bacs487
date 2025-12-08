// backend/testAccount.js

const { createAccount, login, verifyCode } = require("../user/account");

async function run() {
  try {
    console.log("=== Testing Account Creation ===");

    const result = await createAccount({
      email: "testuser@bears.unco.edu",
      password: "MyPassword123",
      displayName: "Test User",
      userRole: "student"
    });

    console.log("Account created:");
    console.log(result);

    console.log("\nNow attempting login BEFORE verification:");
    const loginAttempt = await login({
      email: "testuser@bears.unco.edu",
      password: "MyPassword123"
    });

    console.log(loginAttempt);

    console.log("\nVerification code is above — use verifyCode() to test next.");
  } 
  catch (err) {
    console.error("FULL ERROR:", err);
    console.error("ERROR MESSAGE:", err.message);
    console.error("STACK:", err.stack);
  } 
  finally {
    process.exit();
  }
}

run();
