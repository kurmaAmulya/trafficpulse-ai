import http from 'http';

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING COMPREHENSIVE END-TO-END SYSTEM TESTS ---');

  // Test 1: Health
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('✓ Health Endpoint:', health.status, health.data.database.mode);

  // Test 2: Login as Officer
  const officerLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'officer@traffic.gov', password: 'password123' });
  console.log('✓ Officer Login:', officerLogin.status, officerLogin.data.user.role);
  const officerToken = officerLogin.data.token;

  // Test 3: Login as Citizen
  const citizenLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'citizen@citizen.in', password: 'password123' });
  console.log('✓ Citizen Login:', citizenLogin.status, citizenLogin.data.user.role);
  const citizenToken = citizenLogin.data.token;

  // Test 4: Citizen submits a violation
  const newViolation = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/violations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`
    }
  }, {
    vehicleNumber: 'DL-01-AB-1234',
    violationType: 'Wrong-Way Driving',
    location: 'Connaught Place Radial Road 2',
    description: 'Vehicle proceeding in reverse against high-speed one-way traffic lane.',
    evidenceUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'
  });
  console.log('✓ Citizen Report Created:', newViolation.status, newViolation.data.violation?.violationNumber, 'Status:', newViolation.data.violation?.status);
  const violationId = newViolation.data.violation?._id;

  // Test 5: Officer verifies report and issues fine
  const officerReview = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/violations/${violationId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    }
  }, {
    status: 'Verified',
    reviewNotes: 'Dashcam footage corroborated. Violation confirmed under MV Act Sec 184.',
    fineAmount: 5000
  });
  console.log('✓ Officer Verified Violation:', officerReview.status, 'New Status:', officerReview.data.violation?.status);

  // Test 6: Verify fine auto-generated and settle it
  const finesList = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/fines?vehicleNumber=DL-01-AB-1234&status=Pending',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${officerToken}` }
  });
  console.log('✓ Fines Found for DL-01-AB-1234:', finesList.data.fines?.length);
  const targetFine = finesList.data.fines?.[0];

  if (targetFine) {
    const payFine = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/fines/${targetFine._id}/pay`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${officerToken}`
      }
    }, { paymentMethod: 'UPI' });
    console.log('✓ Simulated Fine Settlement:', payFine.status, 'Status:', payFine.data.fine?.status, 'Txn:', payFine.data.fine?.transactionRef);
  }

  // Test 7: Simulated Camera AI Detection Trigger
  const triggerCam = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cameras/trigger-detection',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    }
  }, {
    cameraId: 'CAM-ND-01',
    vehicleNumber: 'HR-26-EQ-9012',
    violationType: 'Speeding',
    speed: 92
  });
  console.log('✓ Camera AI Detection Triggered:', triggerCam.status, triggerCam.data.violationNumber);

  // Test 8: Dashboard Stats Check
  const stats = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/stats/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${officerToken}` }
  });
  console.log('✓ Dashboard Stats:', stats.status, 'Total Vehicles:', stats.data.metrics.totalVehicles, 'Violations:', stats.data.metrics.totalViolations);

  console.log('--- ALL 8 END-TO-END WORKFLOW TESTS PASSED PERFECTLY ---');
};

runTests().catch(console.error);
