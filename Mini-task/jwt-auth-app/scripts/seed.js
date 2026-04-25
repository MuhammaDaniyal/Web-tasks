// scripts/seed.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import pkg from '@next/env';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';

const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd());

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not set in environment variables');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Remove stale indexes (e.g. old username_1 unique index) and enforce current schema indexes.
        await User.syncIndexes();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Lead.deleteMany({});
        await Activity.deleteMany({});

        // Create Admin
        console.log('👤 Creating users...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@crm.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            isActive: true
        });

        // Create Agents
        const agent1 = await User.create({
            name: 'Ahmed Khan',
            email: 'ahmed@crm.com',
            password: await bcrypt.hash('agent123', 10),
            role: 'agent',
            isActive: true
        });

        const agent2 = await User.create({
            name: 'Sara Ali',
            email: 'sara@crm.com',
            password: await bcrypt.hash('sara123', 10),
            role: 'agent',
            isActive: true
        });

        const agent3 = await User.create({
            name: 'Usman Chaudhry',
            email: 'usman@crm.com',
            password: await bcrypt.hash('usman123', 10),
            role: 'agent',
            isActive: true
        });

        console.log('📝 Creating leads...');

        // Lead 1 - High Priority (Budget > 20M) - Assigned to Ahmed
        const lead1 = await Lead.create({
            name: 'Bilal Siddiqui',
            email: 'bilal@gmail.com',
            phone: '923001234567',
            propertyInterest: '5 Marla House in DHA Phase 6',
            budget: 25000000,
            status: 'New',
            notes: 'Wants corner plot, prefers DHA Phase 6 or Phase 8',
            assignedTo: agent1._id,
            followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            followUpNote: 'Call after 2 PM',
            lastActivityAt: new Date()
        });

        // Lead 2 - Medium Priority (Budget 10M-20M) - Assigned to Sara
        const lead2 = await Lead.create({
            name: 'Fatima Sheikh',
            email: 'fatima@yahoo.com',
            phone: '923332345678',
            propertyInterest: '3 Marla House in Bahria Town',
            budget: 15000000,
            status: 'Contacted',
            notes: 'Looking for ready-to-move property, okay with installment plan',
            assignedTo: agent2._id,
            followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            followUpNote: 'Send property listings via email',
            lastActivityAt: new Date()
        });

        // Lead 3 - Low Priority (Budget < 10M) - Assigned to Usman
        const lead3 = await Lead.create({
            name: 'Raza Ali',
            email: 'raza@hotmail.com',
            phone: '923456789012',
            propertyInterest: '2 Marla House in Askari 11',
            budget: 8000000,
            status: 'New',
            notes: 'First time buyer, needs financing options',
            assignedTo: agent3._id,
            followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            followUpNote: 'Explain payment plan options',
            lastActivityAt: new Date()
        });

        // Lead 4 - High Priority (Budget > 20M) - Unassigned
        const lead4 = await Lead.create({
            name: 'Danish Iqbal',
            email: 'danish@gmail.com',
            phone: '923001112233',
            propertyInterest: '10 Marla House in Gulberg',
            budget: 35000000,
            status: 'New',
            notes: 'Urgent requirement, wants to close within a month',
            assignedTo: null,
            followUpDate: null,
            followUpNote: '',
            lastActivityAt: new Date()
        });

        // Lead 5 - Medium Priority - In Progress
        const lead5 = await Lead.create({
            name: 'Hina Tariq',
            email: 'hina@yahoo.com',
            phone: '923334445566',
            propertyInterest: '1 Kanal Plot in DHA',
            budget: 18000000,
            status: 'In Progress',
            notes: 'Already visited 2 sites, needs final decision support',
            assignedTo: agent1._id,
            followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            followUpNote: 'Send comparison sheet of available plots',
            lastActivityAt: new Date()
        });

        // Lead 6 - Low Priority - Closed (Won)
        const lead6 = await Lead.create({
            name: 'Omar Farooq',
            email: 'omar@outlook.com',
            phone: '923456789123',
            propertyInterest: '5 Marla House in Lake City',
            budget: 9500000,
            status: 'Closed',
            notes: 'Deal completed successfully',
            assignedTo: agent2._id,
            followUpDate: null,
            followUpNote: 'Send thank you gift',
            lastActivityAt: new Date()
        });

        // Lead 7 - Medium Priority - Lost
        const lead7 = await Lead.create({
            name: 'Zainab Malik',
            email: 'zainab@gmail.com',
            phone: '923007788990',
            propertyInterest: '3 Marla House in Wapda Town',
            budget: 12000000,
            status: 'Lost',
            notes: 'Client bought elsewhere',
            assignedTo: agent3._id,
            followUpDate: null,
            followUpNote: '',
            lastActivityAt: new Date()
        });

        // Lead 8 - High Priority - Overdue follow-up
        const lead8 = await Lead.create({
            name: 'Hamza Akhtar',
            email: 'hamza@gmail.com',
            phone: '923112233445',
            propertyInterest: '2 Kanal House in Defence',
            budget: 45000000,
            status: 'Contacted',
            notes: 'Very interested, but follow-up was missed',
            assignedTo: agent1._id,
            followUpDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days overdue
            followUpNote: 'URGENT: Call immediately',
            lastActivityAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // No activity for 7 days
        });

        // Create activity logs for some leads
        console.log('📋 Creating activity logs...');

        await Activity.create({
            leadId: lead1._id,
            performedBy: admin._id,
            action: 'LEAD_CREATED',
            description: 'Lead created by admin'
        });

        await Activity.create({
            leadId: lead1._id,
            performedBy: admin._id,
            action: 'LEAD_ASSIGNED',
            description: `Lead assigned to ${agent1.name}`,
            previousValue: null,
            newValue: agent1._id
        });

        await Activity.create({
            leadId: lead2._id,
            performedBy: admin._id,
            action: 'LEAD_CREATED',
            description: 'Lead created by admin'
        });

        await Activity.create({
            leadId: lead2._id,
            performedBy: agent2._id,
            action: 'STATUS_UPDATED',
            description: 'Status changed from New to Contacted',
            previousValue: 'New',
            newValue: 'Contacted'
        });

        await Activity.create({
            leadId: lead5._id,
            performedBy: agent1._id,
            action: 'STATUS_UPDATED',
            description: 'Status changed from Contacted to In Progress',
            previousValue: 'Contacted',
            newValue: 'In Progress'
        });

        await Activity.create({
            leadId: lead6._id,
            performedBy: agent2._id,
            action: 'LEAD_CLOSED',
            description: 'Lead successfully converted to sale',
            previousValue: 'In Progress',
            newValue: 'Closed'
        });

        // Display summary
        console.log('\n✅ SEEDING COMPLETE!');
        console.log('═══════════════════════════════════════');
        console.log('📊 USERS:');
        console.log(`   Admin: admin@crm.com / admin123`);
        console.log(`   Agent 1: ahmed@crm.com / agent123 (Assigned: 3 leads)`);
        console.log(`   Agent 2: sara@crm.com / sara123 (Assigned: 3 leads)`);
        console.log(`   Agent 3: usman@crm.com / usman123 (Assigned: 2 leads)`);
        console.log('\n📋 LEADS SUMMARY:');
        console.log(`   Total Leads: 8`);
        console.log(`   • High Priority: ${await Lead.countDocuments({ priority: 'High' })} lead(s)`);
        console.log(`   • Medium Priority: ${await Lead.countDocuments({ priority: 'Medium' })} lead(s)`);
        console.log(`   • Low Priority: ${await Lead.countDocuments({ priority: 'Low' })} lead(s)`);
        console.log(`   • New: ${await Lead.countDocuments({ status: 'New' })}`);
        console.log(`   • Contacted: ${await Lead.countDocuments({ status: 'Contacted' })}`);
        console.log(`   • In Progress: ${await Lead.countDocuments({ status: 'In Progress' })}`);
        console.log(`   • Closed: ${await Lead.countDocuments({ status: 'Closed' })}`);
        console.log(`   • Lost: ${await Lead.countDocuments({ status: 'Lost' })}`);
        console.log(`   • Overdue Follow-ups: ${await Lead.countDocuments({ followUpDate: { $lt: new Date() }, status: { $nin: ['Closed', 'Lost'] } })}`);
        console.log('\n📝 ACTIVITY LOGS:');
        console.log(`   Total Activities: ${await Activity.countDocuments()}`);
        console.log('═══════════════════════════════════════');

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seed();