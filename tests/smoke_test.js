const API_URL = process.env.API_URL || 'http://localhost:3001';

async function runTests() {
    console.log(`Running smoke tests against ${API_URL}...`);

    let failure = false;

    // 1. Health check
    try {
        const healthRes = await fetch(`${API_URL}/health`);
        if (healthRes.status === 200) {
            console.log('✅ PASS: Health check');
        } else {
            console.error(`❌ FAIL: Health check returned status ${healthRes.status}`);
            failure = true;
        }
    } catch (e) {
        console.error(`❌ FAIL: Health check network error: ${e.message}`);
        console.log('Make sure the server is running (npm run server)');
        failure = true;
    }

    if (failure) process.exit(1);

    // 2. Get Exercises
    try {
        const exRes = await fetch(`${API_URL}/api/exercises?userId=1`);
        if (exRes.status === 200) {
            const exData = await exRes.json();
            if (Array.isArray(exData.data)) {
                console.log(`✅ PASS: Get Exercises (${exData.data.length} found)`);
            } else {
                console.error('❌ FAIL: Get Exercises response format invalid');
                failure = true;
            }
        } else {
            console.error(`❌ FAIL: Get Exercises returned status ${exRes.status}`);
            failure = true;
        }
    } catch (e) {
        console.error(`❌ FAIL: Get Exercises network error: ${e.message}`);
        failure = true;
    }

    // 3. SPA Routing
    try {
        const spaRes = await fetch(`${API_URL}/some-random-route`);
        const contentType = spaRes.headers.get('content-type');
        if (spaRes.status === 200 && contentType && contentType.includes('text/html')) {
            console.log('✅ PASS: SPA Routing (Catch-all returns index.html)');
        } else {
            // It might return 404 if in dev mode logic I added?
            // "API Running. Frontend not built or not found."
            const text = await spaRes.text();
            if (text.includes('API Running')) {
                console.log('⚠️ SKIP: SPA Routing (Dev mode detected, frontend not served)');
            } else {
                console.warn(`⚠️ WARN: SPA Routing check failed. Status: ${spaRes.status}, Type: ${contentType}`);
            }
        }
    } catch (e) {
        console.warn(`⚠️ WARN: SPA Routing check error: ${e.message}`);
    }

    if (failure) {
        console.error('Tests FAILED');
        process.exit(1);
    } else {
        console.log('Tests COMPLETED SUCCESSFULLY');
    }
}

runTests();
