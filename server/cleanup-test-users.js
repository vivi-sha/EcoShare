const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');
const Settlement = require('./models/Settlement');
const Donation = require('./models/Donation');

// List of test users to delete
const TEST_USER_NAMES = [
    'panchami',
    'shiva',
    'john'
];

async function cleanupTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all test users (case-insensitive)
        const testUsers = await User.find({
            name: {
                $in: TEST_USER_NAMES.map(name => new RegExp(`^${name}$`, 'i'))
            }
        });

        if (testUsers.length === 0) {
            console.log('⚠️  No test users found matching the criteria');
            await mongoose.connection.close();
            return;
        }

        console.log(`\n📋 Found ${testUsers.length} test users to delete:`);
        testUsers.forEach(user => {
            console.log(`   - ${user.name} (${user.email})`);
        });

        // Extract user IDs
        const testUserIds = testUsers.map(u => u.id);

        console.log('\n🗑️  Starting cleanup...\n');

        // 1. Delete donations made by these users
        const donationsResult = await Donation.deleteMany({ userId: { $in: testUserIds } });
        console.log(`✓ Deleted ${donationsResult.deletedCount} donations`);

        // 2. Delete settlements involving these users
        const settlementsResult = await Settlement.deleteMany({
            $or: [
                { fromUserId: { $in: testUserIds } },
                { toUserId: { $in: testUserIds } }
            ]
        });
        console.log(`✓ Deleted ${settlementsResult.deletedCount} settlements`);

        // 3. Find trips where test users are members
        const tripsWithTestUsers = await Trip.find({
            'members.id': { $in: testUserIds }
        });

        console.log(`✓ Found ${tripsWithTestUsers.length} trips involving test users`);

        let tripsDeleted = 0;
        let tripsUpdated = 0;

        for (const trip of tripsWithTestUsers) {
            // Remove test users from members array
            const remainingMembers = trip.members.filter(m => !testUserIds.includes(m.id));

            if (remainingMembers.length === 0) {
                // If no members left, delete the entire trip
                await Trip.deleteOne({ _id: trip._id });
                tripsDeleted++;
            } else {
                // Otherwise, just remove the test users from the trip
                trip.members = remainingMembers;
                await trip.save();
                tripsUpdated++;
            }
        }

        console.log(`✓ Deleted ${tripsDeleted} trips (no remaining members)`);
        console.log(`✓ Updated ${tripsUpdated} trips (removed test users from members)`);

        // 4. Delete expenses paid by test users
        const expensesResult = await Expense.deleteMany({ payerId: { $in: testUserIds } });
        console.log(`✓ Deleted ${expensesResult.deletedCount} expenses`);

        // 5. Finally, delete the test users themselves
        const usersResult = await User.deleteMany({ id: { $in: testUserIds } });
        console.log(`✓ Deleted ${usersResult.deletedCount} users`);

        console.log('\n✅ Cleanup completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Users deleted: ${usersResult.deletedCount}`);
        console.log(`   - Donations deleted: ${donationsResult.deletedCount}`);
        console.log(`   - Settlements deleted: ${settlementsResult.deletedCount}`);
        console.log(`   - Trips deleted: ${tripsDeleted}`);
        console.log(`   - Trips updated: ${tripsUpdated}`);
        console.log(`   - Expenses deleted: ${expensesResult.deletedCount}`);

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the cleanup
console.log('🚀 Starting test user cleanup...\n');
cleanupTestUsers();
