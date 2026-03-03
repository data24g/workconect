const { MongoClient } = require('mongodb');

async function checkDatabase() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('hgltech_db');
        const collection = db.collection('work_sessions');

        const count = await collection.countDocuments();
        console.log(`📊 Total work sessions in database: ${count}`);

        const sessions = await collection.find({}).toArray();
        console.log('\n📋 All work sessions:');
        sessions.forEach((session, index) => {
            console.log(`\n${index + 1}. ID: ${session._id}`);
            console.log(`   Job ID: ${session.jobId}`);
            console.log(`   Worker ID: ${session.workerId}`);
            console.log(`   Business ID: ${session.businessId}`);
            console.log(`   Status: ${session.status}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

checkDatabase();
