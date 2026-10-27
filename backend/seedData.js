const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Shipment = require('./models/Shipment');
const TrackingEvent = require('./models/TrackingEvent');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('\n❌ [Seed Error] Cannot seed database: MongoDB connection failed.');
      console.error('Please verify your MONGODB_URI in backend/.env and ensure MongoDB is reachable.\n');
      process.exit(1);
    }

    console.log('[Seed] Clearing existing demo data...');
    await User.deleteMany();
    await Shipment.deleteMany();
    await TrackingEvent.deleteMany();

    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'Central Admin Logistics',
      email: 'admin@courier.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210',
      address: {
        street: '42 Cloud Tower, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400021',
        country: 'India',
      },
    });

    const customerUser = await User.create({
      name: 'Rajesh Sharma',
      email: 'customer@courier.com',
      password: 'user123',
      role: 'customer',
      phone: '+91 91234 56789',
      address: {
        street: '15 Green Valley Residency, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        country: 'India',
      },
    });

    console.log('[Seed] Creating demo shipments and timeline checkpoints...');

    // Shipment 1: In Transit
    const shipment1 = await Shipment.create({
      trackingNumber: 'TRK-892147',
      sender: {
        name: 'TechMart Solutions',
        email: 'dispatch@techmart.in',
        phone: '+91 98220 11223',
        address: 'B-Wing, MIDC Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400093',
      },
      recipient: {
        name: 'Rajesh Sharma',
        email: 'customer@courier.com',
        phone: '+91 91234 56789',
        address: '15 Green Valley Residency, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
      },
      origin: 'Mumbai',
      destination: 'Bengaluru',
      currentCity: 'Pune Central Hub',
      status: 'In Transit',
      packageType: 'Electronics',
      weight: 2.5,
      dimensions: { length: 35, width: 25, height: 8 },
      serviceType: 'Express Air',
      cost: 320,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      customer: customerUser._id,
      createdBy: adminUser._id,
      notes: 'Handle with care - fragile electronic equipment.',
    });

    await TrackingEvent.create([
      {
        shipmentId: shipment1._id,
        trackingNumber: shipment1.trackingNumber,
        status: 'Booked',
        location: 'Mumbai Sorting Hub',
        description: 'Shipment booking created and registered online by TechMart Solutions.',
        timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment1._id,
        trackingNumber: shipment1.trackingNumber,
        status: 'Picked Up',
        location: 'Andheri East Logistics Center, Mumbai',
        description: 'Courier agent collected package from merchant warehouse.',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment1._id,
        trackingNumber: shipment1.trackingNumber,
        status: 'In Transit',
        location: 'Pune Central Expressway Hub',
        description: 'Package processed through automated laser sorter. Forwarded toward Bengaluru.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
    ]);

    // Shipment 2: Out for Delivery
    const shipment2 = await Shipment.create({
      trackingNumber: 'TRK-451209',
      sender: {
        name: 'Apex Pharma Health Diagnostics',
        email: 'support@apexpharma.com',
        phone: '+91 80099 44332',
        address: 'Plot 7, HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
      },
      recipient: {
        name: 'Dr. Sunita Deshmukh',
        email: 'dr.sunita@cityhospital.org',
        phone: '+91 97654 32100',
        address: 'Room 204, City Care Super Specialty Hospital',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      origin: 'Hyderabad',
      destination: 'Bengaluru',
      currentCity: 'Bengaluru (Koramangala Branch)',
      status: 'Out for Delivery',
      packageType: 'Fragile Goods',
      weight: 1.2,
      dimensions: { length: 25, width: 20, height: 15 },
      serviceType: 'Same Day Delivery',
      cost: 450,
      estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000), // Today in 4 hours
      customer: customerUser._id,
      createdBy: adminUser._id,
      notes: 'Temperature sensitive diagnostic supplies.',
    });

    await TrackingEvent.create([
      {
        shipmentId: shipment2._id,
        trackingNumber: shipment2.trackingNumber,
        status: 'Booked',
        location: 'Hyderabad Air Freight Center',
        description: 'Priority courier order booked and barcode label printed.',
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment2._id,
        trackingNumber: shipment2.trackingNumber,
        status: 'Picked Up',
        location: 'HITEC Logistics Depot, Hyderabad',
        description: 'Package received into temperature-controlled container.',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment2._id,
        trackingNumber: shipment2.trackingNumber,
        status: 'In Transit',
        location: 'Kempegowda Cargo Terminal, Bengaluru',
        description: 'Flight arrived at Bengaluru. Cleared hub transit inspection.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment2._id,
        trackingNumber: shipment2.trackingNumber,
        status: 'Out for Delivery',
        location: 'Koramangala Delivery Hub, Bengaluru',
        description: 'Package assigned to courier delivery partner (Vikram Singh - ID: DRV-882). OTP will be verified upon delivery.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        updatedBy: adminUser._id,
      },
    ]);

    // Shipment 3: Delivered
    const shipment3 = await Shipment.create({
      trackingNumber: 'TRK-339812',
      sender: {
        name: 'National University Examination Cell',
        email: 'exams@univ-edu.org',
        phone: '+91 11234 88776',
        address: 'Administrative Block, University Campus',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
      },
      recipient: {
        name: 'Rajesh Sharma',
        email: 'customer@courier.com',
        phone: '+91 91234 56789',
        address: '15 Green Valley Residency, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
      },
      origin: 'New Delhi',
      destination: 'Bengaluru',
      currentCity: 'Bengaluru',
      status: 'Delivered',
      packageType: 'Document',
      weight: 0.4,
      dimensions: { length: 30, width: 22, height: 2 },
      serviceType: 'Standard Delivery',
      cost: 140,
      estimatedDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000),
      customer: customerUser._id,
      createdBy: adminUser._id,
      notes: 'Official University Degree Certificate & Transcript.',
    });

    await TrackingEvent.create([
      {
        shipmentId: shipment3._id,
        trackingNumber: shipment3.trackingNumber,
        status: 'Booked',
        location: 'Connaught Place Post Hub, New Delhi',
        description: 'Document registered for cloud tracking dispatch.',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment3._id,
        trackingNumber: shipment3.trackingNumber,
        status: 'Picked Up',
        location: 'Delhi Central Sorting Facility',
        description: 'Processed and sorted for South-Zone direct transit line.',
        timestamp: new Date(Date.now() - 58 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment3._id,
        trackingNumber: shipment3.trackingNumber,
        status: 'In Transit',
        location: 'Nagpur National Logistics Hub',
        description: 'Vehicle en route via automated cross-docking checkpoint.',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment3._id,
        trackingNumber: shipment3.trackingNumber,
        status: 'Out for Delivery',
        location: 'Bengaluru South Hub',
        description: 'Dispatched for doorstep delivery.',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment3._id,
        trackingNumber: shipment3.trackingNumber,
        status: 'Delivered',
        location: 'Koramangala, Bengaluru',
        description: 'Package successfully delivered. Received and signed by Rajesh Sharma.',
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
    ]);

    // Shipment 4: Arrived at Facility
    const shipment4 = await Shipment.create({
      trackingNumber: 'TRK-771234',
      sender: {
        name: 'South Cotton Textiles',
        email: 'sales@southcotton.in',
        phone: '+91 94441 55667',
        address: '12 T. Nagar Commercial Complex',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600017',
      },
      recipient: {
        name: 'Rajesh Sharma',
        email: 'customer@courier.com',
        phone: '+91 91234 56789',
        address: '15 Green Valley Residency, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
      },
      origin: 'Chennai',
      destination: 'Bengaluru',
      currentCity: 'Bengaluru Regional Distribution Hub',
      status: 'Arrived at Facility',
      packageType: 'Large Parcel',
      weight: 4.8,
      serviceType: 'Standard Delivery',
      cost: 290,
      bookingDate: new Date(Date.now() - 30 * 60 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
      customer: customerUser._id,
      createdBy: adminUser._id,
      notes: 'Handloom apparel consignment.',
    });

    await TrackingEvent.create([
      {
        shipmentId: shipment4._id,
        trackingNumber: shipment4.trackingNumber,
        status: 'Booked',
        location: 'Chennai Main Post Hub',
        description: 'Consignment booked and shipping label generated.',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment4._id,
        trackingNumber: shipment4.trackingNumber,
        status: 'Picked Up',
        location: 'T. Nagar Logistics Depot, Chennai',
        description: 'Collected by courier partner.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment4._id,
        trackingNumber: shipment4.trackingNumber,
        status: 'In Transit',
        location: 'Hosur Border Logistics Checkpoint',
        description: 'Cleared interstate corridor scan.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment4._id,
        trackingNumber: shipment4.trackingNumber,
        status: 'Arrived at Facility',
        location: 'Bengaluru Regional Distribution Hub',
        description: 'Received at regional sorting hub. Inbound container unloaded and verified.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
    ]);

    // Shipment 5: Delivery Failed
    const shipment5 = await Shipment.create({
      trackingNumber: 'TRK-552391',
      sender: {
        name: 'Pune Precision Tools',
        email: 'orders@punetools.co.in',
        phone: '+91 92233 44556',
        address: 'B-14 Bhosari Industrial Area',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411026',
      },
      recipient: {
        name: 'Amit Verma',
        email: 'amit.verma@indiamail.com',
        phone: '+91 98112 33445',
        address: 'Flat 502, Prestige Tower, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560066',
      },
      origin: 'Pune',
      destination: 'Bengaluru',
      currentCity: 'Whitefield Delivery Center, Bengaluru',
      status: 'Delivery Failed',
      packageType: 'Heavy Freight',
      weight: 6.2,
      serviceType: 'Express Air',
      cost: 470,
      bookingDate: new Date(Date.now() - 40 * 60 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() + 12 * 60 * 60 * 1000),
      customer: customerUser._id,
      createdBy: adminUser._id,
      notes: 'Industrial calibration drill bits.',
    });

    await TrackingEvent.create([
      {
        shipmentId: shipment5._id,
        trackingNumber: shipment5.trackingNumber,
        status: 'Booked',
        location: 'Pune Cargo Hub',
        description: 'Industrial consignment registered.',
        timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment5._id,
        trackingNumber: shipment5.trackingNumber,
        status: 'Picked Up',
        location: 'Bhosari Hub, Pune',
        description: 'Package collected from consignor.',
        timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment5._id,
        trackingNumber: shipment5.trackingNumber,
        status: 'In Transit',
        location: 'Kempegowda Air Freight Hub, Bengaluru',
        description: 'Transferred to Whitefield local facility.',
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment5._id,
        trackingNumber: shipment5.trackingNumber,
        status: 'Out for Delivery',
        location: 'Whitefield Delivery Center',
        description: 'Courier agent attempted doorstep delivery.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment5._id,
        trackingNumber: shipment5.trackingNumber,
        status: 'Delivery Failed',
        location: 'Whitefield, Bengaluru',
        description: 'Delivery attempt failed: Premises locked & recipient phone not reachable. Rescheduled for next business cycle.',
        notes: 'Driver note: Gate security reported resident out of city.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
    ]);

    // Shipment 6: Returned
    const shipment6 = await Shipment.create({
      trackingNumber: 'TRK-664411',
      sender: {
        name: 'Bengal Books & Crafts',
        email: 'help@bengalcrafts.com',
        phone: '+91 93311 22334',
        address: '5 College Street',
        city: 'Kolkata',
        state: 'West Bengal',
        postalCode: '700073',
      },
      recipient: {
        name: 'Suresh Menon',
        email: 'suresh.menon@mail.org',
        phone: '+91 97401 22334',
        address: '88 Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
      },
      origin: 'Kolkata',
      destination: 'Bengaluru',
      currentCity: 'Kolkata Return Center',
      status: 'Returned',
      packageType: 'Small Box',
      weight: 1.8,
      serviceType: 'Standard Delivery',
      cost: 180,
      bookingDate: new Date(Date.now() - 120 * 60 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() - 48 * 60 * 60 * 1000),
      customer: customerUser._id,
      createdBy: adminUser._id,
      notes: 'Consignment rejected on delivery. Returned to originator.',
    });

    await TrackingEvent.create([
      {
        shipmentId: shipment6._id,
        trackingNumber: shipment6.trackingNumber,
        status: 'Booked',
        location: 'Kolkata Central Post Office',
        description: 'Shipment order booked and manifest prepared.',
        timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment6._id,
        trackingNumber: shipment6.trackingNumber,
        status: 'Picked Up',
        location: 'Kolkata Sorting Center',
        description: 'Package picked up for dispatch.',
        timestamp: new Date(Date.now() - 100 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment6._id,
        trackingNumber: shipment6.trackingNumber,
        status: 'In Transit',
        location: 'Bengaluru Airport Terminal',
        description: 'Arrival at destination airport.',
        timestamp: new Date(Date.now() - 80 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment6._id,
        trackingNumber: shipment6.trackingNumber,
        status: 'Delivery Failed',
        location: 'Indiranagar, Bengaluru',
        description: 'Customer rejected parcel. Consignor requested return.',
        timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
      {
        shipmentId: shipment6._id,
        trackingNumber: shipment6.trackingNumber,
        status: 'Returned',
        location: 'Kolkata Return Center',
        description: 'Package returned to originating merchant facility in Kolkata. Manifest closed.',
        notes: 'Signed and acknowledged by seller warehouse officer.',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        updatedBy: adminUser._id,
      },
    ]);

    console.log('\n==========================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('==========================================');
    console.log('Demo Credentials for College Presentation:');
    console.log('  Admin Account:');
    console.log('    Email:    admin@courier.com');
    console.log('    Password: admin123');
    console.log('  Customer Account:');
    console.log('    Email:    customer@courier.com');
    console.log('    Password: user123');
    console.log('\nSample Tracking Numbers to Test (Covering All Statuses):');
    console.log('  1. TRK-892147  -> In Transit (Mumbai to Bengaluru)');
    console.log('  2. TRK-451209  -> Out for Delivery (Hyderabad to Bengaluru)');
    console.log('  3. TRK-339812  -> Delivered (New Delhi to Bengaluru)');
    console.log('  4. TRK-771234  -> Arrived at Facility (Chennai to Bengaluru)');
    console.log('  5. TRK-552391  -> Delivery Failed (Pune to Bengaluru)');
    console.log('  6. TRK-664411  -> Returned (Kolkata to Bengaluru)');
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
