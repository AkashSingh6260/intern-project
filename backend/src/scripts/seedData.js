const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectDB = require('../config/db');
const { User, Store, Rating } = require('../models');

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Store.deleteMany({});
    await Rating.deleteMany({});

    console.log('Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@1234', salt);
    const userPassword = await bcrypt.hash('User@1234', salt);
    const ownerPassword = await bcrypt.hash('Owner@1234', salt);

    // Users (names must be between 20 and 60 characters)
    const adminUser = await User.create({
      name: 'System Admin Super User',
      email: 'admin@platform.com',
      password: adminPassword,
      address: '100 Main Street, Suite 400, New York, NY',
      role: 'admin',
    });

    const edwardOwner = await User.create({
      name: 'Edward Norton Store Owner',
      email: 'edward.owner@bakery.com',
      password: ownerPassword,
      address: '742 Evergreen Terrace, Springfield, OR',
      role: 'store_owner',
    });

    const dianaOwner = await User.create({
      name: 'Diana Prince Fashion Owner',
      email: 'diana.owner@store.com',
      password: ownerPassword,
      address: '250 Queen Street, Suite 200, Boston, MA',
      role: 'store_owner',
    });

    const aliceUser = await User.create({
      name: 'Alice Smith Regular Buyer',
      email: 'alice.shopper@gmail.com',
      password: userPassword,
      address: '123 Maple Avenue, Apartment 4B, Chicago, IL',
      role: 'normal_user',
    });

    const bobUser = await User.create({
      name: 'Bob Johnson Frequent Buyer',
      email: 'bob.reviewer@gmail.com',
      password: userPassword,
      address: '456 Oakwood Drive, Austin, TX',
      role: 'normal_user',
    });

    const charlieUser = await User.create({
      name: 'Charlie Brown Daily Shopper',
      email: 'charlie.specialist@gmail.com',
      password: userPassword,
      address: '789 Pine Ridge Circle, Seattle, WA',
      role: 'normal_user',
    });

    console.log('Creating demo stores...');
    const bakery = await Store.create({
      name: 'The Artisan Bakery and Cafe',
      email: 'contact@artisanbakery.com',
      address: '742 Evergreen Terrace, Springfield, OR',
      owner: edwardOwner._id,
    });

    const organic = await Store.create({
      name: 'Fresh Organic Grocery Store',
      email: 'info@freshgrocery.com',
      address: '250 Queen Street, Suite 200, Boston, MA',
      owner: dianaOwner._id,
    });

    const tech = await Store.create({
      name: 'Downtown Electronics Supply',
      email: 'sales@downtownehub.com',
      address: '1200 Innovation Way, Cambridge, MA',
      owner: null,
    });

    console.log('Creating demo ratings...');
    await Rating.insertMany([
      { user: aliceUser._id, store: bakery._id, rating: 5 },
      { user: bobUser._id, store: bakery._id, rating: 4 },
      { user: charlieUser._id, store: bakery._id, rating: 5 },

      { user: aliceUser._id, store: organic._id, rating: 4 },
      { user: bobUser._id, store: organic._id, rating: 5 },

      { user: charlieUser._id, store: tech._id, rating: 4 },
    ]);

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
