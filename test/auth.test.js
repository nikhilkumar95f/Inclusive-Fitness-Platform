const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("signup and login work for a new user", async () => {
  const email = `test.user.${Date.now()}@example.com`;

  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email,
      password: "Password123!"
    })
  });

  assert.equal(signupResponse.status, 201);

  const signupData = await signupResponse.json();
  assert.equal(signupData.success, true);
  assert.equal(signupData.user.email, email);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "Password123!"
    })
  });

  assert.equal(loginResponse.status, 200);
  const loginData = await loginResponse.json();
  assert.equal(loginData.success, true);
  assert.equal(loginData.user.email, email);
});
