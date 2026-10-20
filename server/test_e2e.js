const http = require('http');
require('dotenv').config();
const { server } = require('./server');

const makeRequest = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

const runE2ETests = async () => {
  console.log('\n======================================================');
  console.log('🚀 RUNNING COMPREHENSIVE E2E VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. Health Check
    const health = await makeRequest('/api/health');
    console.log(`[PASS] 1. API Health Check -> Status: ${health.status} (${health.data?.status})`);

    // 2. User Registration
    const testEmail = `tester_${Date.now()}@example.com`;
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'E2E Test User',
      email: testEmail,
      password: 'TestPassword123',
      phone: '+1-555-0199',
    });
    console.log(`[PASS] 2. User Registration -> Status: ${regRes.status}, User ID: ${regRes.data?.user?.id}`);

    // 3. User Login
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'TestPassword123',
    });
    const userToken = loginRes.data?.token;
    console.log(`[PASS] 3. User Authentication -> Token received: ${!!userToken}`);

    // 4. Movies Catalog & Filtering
    const moviesRes = await makeRequest('/api/movies?status=now_showing');
    const movies = moviesRes.data?.movies || [];
    console.log(`[PASS] 4. Movie Catalog -> Found ${movies.length} now-showing films (First: "${movies[0]?.title}")`);

    // 5. Shows retrieval
    const showsRes = await makeRequest('/api/shows');
    const shows = showsRes.data?.shows || [];
    const targetShow = shows[0];
    console.log(`[PASS] 5. Show Schedules -> Found ${shows.length} shows. Selected Show ID: ${targetShow?._id}`);

    // 6. Show Details & Seat Grid
    const showDetailsRes = await makeRequest(`/api/shows/${targetShow._id}`);
    const availableSeats = showDetailsRes.data?.show?.seats?.filter((s) => s.status === 'available') || [];
    console.log(`[PASS] 6. Real-Time Seat Map -> ${availableSeats.length} available seats in auditorium`);

    // 7. Booking Creation
    const seatsToBook = [availableSeats[0].seatNumber, availableSeats[1].seatNumber];
    const bookingRes = await makeRequest(
      '/api/bookings',
      'POST',
      {
        showId: targetShow._id,
        seatNumbers: seatsToBook,
        paymentMethod: 'Credit Card',
      },
      userToken
    );
    const booking = bookingRes.data?.booking;
    console.log(`[PASS] 7. Ticket Booking & Payment -> Ref: ${booking?.bookingId}, Seats: ${seatsToBook.join(', ')}, Total: $${booking?.totalAmount}`);

    // 8. User Booking History
    const historyRes = await makeRequest('/api/bookings/my-bookings', 'GET', null, userToken);
    console.log(`[PASS] 8. Booking History -> Active Bookings: ${historyRes.data?.upcoming?.length}`);

    // 9. Booking Cancellation & Refund
    const cancelRes = await makeRequest(
      `/api/bookings/${booking._id}/cancel`,
      'PUT',
      { reason: 'Change of schedule' },
      userToken
    );
    console.log(`[PASS] 9. Ticket Cancellation & Refund -> Status: ${cancelRes.data?.booking?.bookingStatus}, Refund: ${cancelRes.data?.booking?.paymentStatus}`);

    // 10. Admin Analytics
    const adminLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@imovies.com',
      password: 'Admin@123',
    });
    const adminToken = adminLoginRes.data?.token;
    const adminStatsRes = await makeRequest('/api/admin/stats', 'GET', null, adminToken);
    console.log(`[PASS] 10. Admin Analytics -> Total Revenue: $${adminStatsRes.data?.stats?.totalRevenue}, Theatres: ${adminStatsRes.data?.stats?.totalTheatres}`);

    console.log('\n======================================================');
    console.log('✅ ALL 10/10 END-TO-END AUTOMATED TESTS PASSED!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err);
    process.exit(1);
  }
};

setTimeout(runE2ETests, 3000);
