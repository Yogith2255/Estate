require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');

const app = require('../server');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await response.json().catch(() => ({}));
  return { status: response.status, body: json };
}

async function runTests() {
  console.log('\n============================================================');
  console.log('       ESTATEHUB FULL-STACK AUTOMATED TEST SUITE');
  console.log('============================================================\n');

  // Connect DB if not connected
  if (mongoose.connection.readyState !== 1) {
    const connectDB = require('../config/database');
    await connectDB();
  }

  // Start test server on random port
  await new Promise((resolve) => {
    const testPort = 5987;
    server = app.listen(testPort, () => {
      baseUrl = `http://127.0.0.1:${testPort}`;
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, failureDetails = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${failureDetails}`);
      failed++;
    }
  }

  try {
    // 1. Health checks
    console.log('\n--- Section 1: Health & Connectivity ---');
    const health = await request('/api/health');
    assert(health.status === 200 && health.body.success, 'GET /api/health responds 200 OK');

    const dbHealth = await request('/api/health/db');
    assert(dbHealth.status === 200 && dbHealth.body.data.status === 'connected', 'GET /api/health/db verifies MongoDB connection');

    // 2. Authentication & Authorization
    console.log('\n--- Section 2: Authentication & Role Authorization ---');
    const testEmail = `testuser_${Date.now()}@test.com`;

    // Registration
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Auto Test Customer',
        email: testEmail,
        phone: '+91 99999 88888',
        password: 'Password@123',
        role: 'admin', // Attack vector: attempt privilege escalation
      },
    });
    assert(regRes.status === 201 && regRes.body.success, 'Valid customer registration succeeds');
    assert(regRes.body.data.user.role === 'customer', 'Public registration forces "customer" role (anti-privilege-escalation)');
    const customerToken = regRes.body.data.token;

    // Duplicate email registration
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Guy',
        email: testEmail,
        password: 'Password@123',
      },
    });
    assert(dupRes.status === 409, 'Duplicate email registration rejected with 409 Conflict');

    // Invalid login
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'WrongPassword!',
      },
    });
    assert(badLogin.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // Successful customer login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'Password@123',
      },
    });
    assert(loginRes.status === 200 && loginRes.body.data.token, 'Customer login authenticates and returns JWT');

    // Admin login
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@demo.com',
        password: 'Admin@123',
      },
    });
    assert(adminLogin.status === 200 && adminLogin.body.data.user.role === 'admin', 'Admin login succeeds with "admin" role');
    const adminToken = adminLogin.body.data.token;

    // Agent login
    const agentLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'agent@demo.com',
        password: 'Agent@123',
      },
    });
    assert(agentLogin.status === 200 && agentLogin.body.data.user.role === 'agent', 'Agent login succeeds with "agent" role');
    const agentToken = agentLogin.body.data.token;

    // Protected route without token
    const unauthRes = await request('/api/auth/me');
    assert(unauthRes.status === 401, 'Protected route without token rejected with 401');

    // Customer attempting to access Admin User management API
    const forbiddenRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(forbiddenRes.status === 403, 'Customer attempting to access Admin API rejected with 403 Forbidden');

    // Admin accessing Admin User management API
    const adminUsersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsersRes.status === 200 && Array.isArray(adminUsersRes.body.data.users), 'Admin access to /api/users authorized 200 OK');

    // 3. Projects & Properties
    console.log('\n--- Section 3: Projects & Properties ---');
    const projectsRes = await request('/api/projects');
    assert(projectsRes.status === 200 && projectsRes.body.data.projects.length > 0, 'Fetch real projects from MongoDB');

    const sampleProjectId = projectsRes.body.data.projects[0]._id;
    const projectDetail = await request(`/api/projects/${sampleProjectId}`);
    assert(projectDetail.status === 200 && projectDetail.body.data.project.projectName, 'Fetch single project details with units');

    const propertiesRes = await request('/api/properties?city=Hyderabad');
    assert(propertiesRes.status === 200 && propertiesRes.body.data.properties.length > 0, 'Filter property listings by city=Hyderabad');

    const samplePropId = propertiesRes.body.data.properties[0]._id;
    const propDetail = await request(`/api/properties/${samplePropId}`);
    assert(propDetail.status === 200 && propDetail.body.data.property.title, 'Fetch single property details');

    // 4. Customer Workflows (Favorites, Enquiry, Site Visit)
    console.log('\n--- Section 4: Customer Portal Workflows ---');
    // Save to favorites
    const favAdd = await request('/api/favorites', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { propertyId: samplePropId },
    });
    assert(favAdd.status === 201 || favAdd.status === 200, 'Save property to customer favorites');

    // Prevent duplicate favorites
    const dupFav = await request('/api/favorites', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { propertyId: samplePropId },
    });
    assert(dupFav.status === 200 && dupFav.body.message.includes('already'), 'Prevent duplicate favorite for same property');

    // Fetch favorites
    const favGet = await request('/api/favorites', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(favGet.status === 200 && favGet.body.data.properties.length >= 1, 'Retrieve customer saved homes');

    // Submit enquiry
    const enqRes = await request('/api/leads/enquiry', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        customerName: 'Auto Test Customer',
        phone: '+91 99999 88888',
        email: testEmail,
        interestedProject: 'Aparna Cyber Heights',
        message: 'Requesting weekend consultation.',
      },
    });
    assert(enqRes.status === 201 && enqRes.body.data.lead._id, 'Customer enquiry saved to MongoDB as a Lead');

    // Request site visit
    const visitRes = await request('/api/site-visits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        clientName: 'Auto Test Customer',
        phone: '+91 99999 88888',
        date: '2026-11-05',
        timeSlot: 'Morning (10:00 AM - 1:00 PM)',
        project: 'Aparna Cyber Heights',
      },
    });
    assert(visitRes.status === 201 && visitRes.body.data.siteVisit._id, 'Customer site visit scheduled');

    // 5. Agent & Admin Management Workflows
    console.log('\n--- Section 5: Agent & Admin Workflows ---');
    // Agent views leads
    const agentLeads = await request('/api/leads', {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    assert(agentLeads.status === 200 && Array.isArray(agentLeads.body.data.leads), 'Agent retrieves authorized leads');

    // Update lead status
    if (agentLeads.body.data.leads.length > 0) {
      const targetLeadId = agentLeads.body.data.leads[0]._id;
      const leadUpdate = await request(`/api/leads/${targetLeadId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${agentToken}` },
        body: {
          status: 'Qualified',
          newNote: 'Verified budget and floor requirement via phone consultation.',
        },
      });
      assert(leadUpdate.status === 200 && leadUpdate.body.data.lead.status === 'Qualified', 'Agent updates lead status and adds activity note');
    }

    // Admin dashboard metrics
    const adminStats = await request('/api/dashboard/admin', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminStats.status === 200 &&
      typeof adminStats.body.data.totalProjects === 'number' &&
      typeof adminStats.body.data.totalLeads === 'number',
      'Admin dashboard derives live statistics from database'
    );

    // Agent dashboard metrics
    const agentStats = await request('/api/dashboard/agent', {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    assert(
      agentStats.status === 200 &&
      typeof agentStats.body.data.totalLeads === 'number' &&
      typeof agentStats.body.data.activeListings === 'number',
      'Agent dashboard derives live operational metrics from database'
    );

    // 6. Data Integrity & Double-Booking Prevention
    console.log('\n--- Section 6: Data Integrity & Concurrency ---');
    // Fetch inventory units
    const invRes = await request('/api/inventory');
    const availableUnit = invRes.body.data.rawUnits.find((u) => u.status === 'available' || u.status === 'Available');

    if (availableUnit) {
      // First booking succeeds
      const b1 = await request('/api/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          clientName: 'Concurrent Buyer 1',
          unitId: availableUnit._id,
          agreedPrice: availableUnit.price,
        },
      });
      assert(b1.status === 201 && b1.body.data.booking.bookingReference, 'First booking on available unit succeeds');

      // Second booking on the exact same unit MUST fail
      const b2 = await request('/api/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          clientName: 'Concurrent Buyer 2',
          unitId: availableUnit._id,
          agreedPrice: availableUnit.price,
        },
      });
      assert(b2.status === 409, 'Double-booking prevention: Second booking on same unit rejected with 409 Conflict');
    } else {
      console.log('  ! Note: No available unit found to test double-booking');
    }

    // Invalid ObjectId format
    const badIdRes = await request('/api/properties/not-a-valid-id-123');
    assert(badIdRes.status === 404 || badIdRes.status === 400, 'Invalid ID format gracefully handled');

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }

  console.log('\n============================================================');
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
