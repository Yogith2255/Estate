require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Project = require('../models/Project');
const UnitType = require('../models/UnitType');
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const LeadActivity = require('../models/LeadActivity');
const SiteVisit = require('../models/SiteVisit');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('[Seed] Error: MONGODB_URI not found.');
      process.exit(1);
    }

    await mongoose.connect(uri, { dbName: 'estatehub' });
    console.log('[Seed] Connected to MongoDB database: estatehub');

    // 1. Seed Users
    console.log('[Seed] Seeding users...');
    const salt = await bcrypt.genSalt(10);

    const demoUsers = [
      {
        name: 'Priya Sharma',
        email: 'customer@demo.com',
        phone: '+91 98451 12345',
        passwordHash: await bcrypt.hash('Customer@123', salt),
        role: 'customer',
        status: 'active',
        agency: 'Direct Client',
      },
      {
        name: 'Vikram Malhotra',
        email: 'agent@demo.com',
        phone: '+91 98340 56789',
        passwordHash: await bcrypt.hash('Agent@123', salt),
        role: 'agent',
        status: 'active',
        agency: 'EstateHub Hyderabad Metro',
      },
      {
        name: 'Sunita Reddy',
        email: 'admin@demo.com',
        phone: '+91 99100 11111',
        passwordHash: await bcrypt.hash('Admin@123', salt),
        role: 'admin',
        status: 'active',
        agency: 'EstateHub Executive Leadership',
      },
      {
        name: 'Pooja Hegde',
        email: 'pooja.hegde@estatehub.in',
        phone: '+91 98840 91822',
        passwordHash: await bcrypt.hash('Agent@123', salt),
        role: 'agent',
        status: 'active',
        agency: 'EstateHub Bengaluru Urban',
      },
      {
        name: 'Suresh Patil',
        email: 'suresh.patil@estatehub.in',
        phone: '+91 98220 77150',
        passwordHash: await bcrypt.hash('Agent@123', salt),
        role: 'agent',
        status: 'active',
        agency: 'EstateHub Pune Hub',
      },
    ];

    const usersMap = {};
    for (const u of demoUsers) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`  + Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`  * User already exists: ${u.email}`);
      }
      usersMap[u.email] = existing;
    }

    const adminUser = usersMap['admin@demo.com'];
    const agentVikram = usersMap['agent@demo.com'];
    const customerPriya = usersMap['customer@demo.com'];

    // 2. Seed Projects
    console.log('[Seed] Seeding developer projects...');
    const sampleProjects = [
      {
        projectName: 'Aparna Cyber Heights',
        slug: 'aparna-cyber-heights',
        propertyCategory: 'Luxury High-rise',
        status: 'under-construction',
        locality: 'Financial District',
        city: 'Hyderabad',
        state: 'Telangana',
        fullAddress: 'Financial District, Gachibowli, Hyderabad',
        totalUnits: 420,
        availableUnits: 84,
        startingPrice: 16500000,
        possessionDate: 'Dec 2027',
        reraNumber: 'P02400004521',
        featured: true,
        description: 'Ultra-luxury high-rise community situated right opposite WaveRock in the Financial District.',
        amenities: ['100% Power Backup', 'Olympic Pool', 'Squash Court', 'Clubhouse', 'EV Charging'],
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        ],
        createdBy: adminUser._id,
      },
      {
        projectName: 'Prestige Tech Vista',
        slug: 'prestige-tech-vista',
        propertyCategory: 'Premium Apartments',
        status: 'ready-to-move',
        locality: 'Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        fullAddress: 'ECC Road, Whitefield, Bengaluru',
        totalUnits: 360,
        availableUnits: 32,
        startingPrice: 14500000,
        possessionDate: 'Ready',
        reraNumber: 'PRM/KA/RERA/1251/446/PR/171015/000451',
        featured: true,
        description: 'Move-in ready residences adjacent to ITPL corridor with lush manicured gardens.',
        amenities: ['Tennis Court', 'Gymnasium', 'Heated Indoor Pool', 'Children Play Zone'],
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        ],
        createdBy: adminUser._id,
      },
      {
        projectName: 'Godrej Horizon Marina',
        slug: 'godrej-horizon-marina',
        propertyCategory: 'Sea-facing Residences',
        status: 'under-construction',
        locality: 'Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        fullAddress: 'Worli Sea Face, Mumbai',
        totalUnits: 180,
        availableUnits: 19,
        startingPrice: 42500000,
        possessionDate: 'Jun 2028',
        reraNumber: 'P51900034291',
        featured: true,
        description: 'Bespoke sea-facing towers offering sweeping views of the Arabian Sea and Bandra-Worli Sea Link.',
        amenities: ['Private Helipad', 'Infinity Sky Deck', 'Private Concierge', 'Wine Cellar'],
        images: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        ],
        createdBy: adminUser._id,
      },
      {
        projectName: 'Kolte-Patil Tech Greens',
        slug: 'kolte-patil-tech-greens',
        propertyCategory: 'Integrated Township',
        status: 'upcoming',
        locality: 'Hinjawadi Phase 1',
        city: 'Pune',
        state: 'Maharashtra',
        fullAddress: 'Hinjawadi Phase 1, Pune',
        totalUnits: 550,
        availableUnits: 340,
        startingPrice: 8200000,
        possessionDate: 'Mar 2028',
        reraNumber: 'P52100028914',
        featured: false,
        description: 'Eco-conscious township with 60% open greens near Hinjawadi IT parks.',
        amenities: ['Solar Power', 'Organic Farm', 'Jogging Track', 'Co-working Pods'],
        images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'],
        createdBy: adminUser._id,
      },
      {
        projectName: 'Casagrand First City',
        slug: 'casagrand-first-city',
        propertyCategory: 'Gated Community Villa',
        status: 'ready-to-move',
        locality: 'Sholinganallur, OMR',
        city: 'Chennai',
        state: 'Tamil Nadu',
        fullAddress: 'Sholinganallur, OMR, Chennai',
        totalUnits: 210,
        availableUnits: 14,
        startingPrice: 19500000,
        possessionDate: 'Ready',
        reraNumber: 'TN/01/Building/0114/2020',
        featured: false,
        description: 'Exclusive Spanish-themed luxury villas along Chennai IT corridor.',
        amenities: ['Private Garden', 'Clubhouse', 'Badminton Court', '24x7 Security'],
        images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'],
        createdBy: adminUser._id,
      },
      {
        projectName: 'My Home Bhooja Grand',
        slug: 'my-home-bhooja-grand',
        propertyCategory: 'Super Luxury Condos',
        status: 'ready-to-move',
        locality: 'HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        fullAddress: 'HITEC City, Hyderabad',
        totalUnits: 290,
        availableUnits: 28,
        startingPrice: 28000000,
        possessionDate: 'Ready',
        reraNumber: 'P02400001182',
        featured: true,
        description: 'Flagship high-rise condominium complex in the heart of HITEC City.',
        amenities: ['Rooftop Helipad', 'Temperature Controlled Pool', 'Billiards Room', 'Banquet Hall'],
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
        createdBy: adminUser._id,
      },
    ];

    const projectDocs = {};
    for (const p of sampleProjects) {
      let doc = await Project.findOne({ projectName: p.projectName });
      if (!doc) {
        doc = await Project.create(p);
        console.log(`  + Created project: ${p.projectName}`);
      }
      projectDocs[p.projectName] = doc;
    }

    // 3. Seed UnitTypes and Units for Aparna Cyber Heights & Prestige Tech Vista
    console.log('[Seed] Seeding unit types & inventory units...');
    const aparna = projectDocs['Aparna Cyber Heights'];
    if (aparna) {
      let ut1 = await UnitType.findOne({ projectId: aparna._id, name: '3 BHK Luxury' });
      if (!ut1) {
        ut1 = await UnitType.create({
          projectId: aparna._id,
          name: '3 BHK Luxury',
          bedrooms: 3,
          bathrooms: 3,
          area: 1850,
          price: 16500000,
          amenities: ['East Facing', 'Corner Balcony', 'Modular Kitchen'],
        });
      }

      const sampleUnits = [
        { unitNumber: 'A-401', floor: 4, area: 1850, price: 16500000, status: 'available' },
        { unitNumber: 'A-402', floor: 4, area: 1850, price: 16500000, status: 'booked' },
        { unitNumber: 'B-1204', floor: 12, area: 1850, price: 17200000, status: 'available' },
      ];

      for (const u of sampleUnits) {
        let existingUnit = await Unit.findOne({ projectId: aparna._id, unitNumber: u.unitNumber });
        if (!existingUnit) {
          await Unit.create({
            projectId: aparna._id,
            unitTypeId: ut1._id,
            ...u,
          });
          console.log(`  + Created unit: ${u.unitNumber} (${u.status})`);
        }
      }
    }

    // 4. Seed Properties
    console.log('[Seed] Seeding residential property listings...');
    const sampleProperties = [
      {
        title: 'The Skyview Luxury Penthouse',
        price: 32500000,
        listingType: 'sale',
        propertyType: 'Penthouse',
        status: 'active',
        featured: true,
        address: {
          street: 'Tower 4, Financial District',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500032',
          neighborhood: 'Gachibowli Outer Ring Rd',
        },
        specs: {
          beds: 4,
          baths: 4.5,
          sqft: 4200,
          lotSize: 'N/A',
          yearBuilt: 2024,
          garageSpaces: 3,
        },
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        ],
        agent: {
          id: agentVikram._id.toString(),
          name: 'Vikram Malhotra',
          agency: 'EstateHub Prime Realty Group',
          phone: '+91 98450 11980',
          email: 'agent@demo.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        },
        agentId: agentVikram._id,
        description: 'High-floor corner penthouse with panoramic skyline views of Hyderabad Financial District. Features italian marble flooring, double-height living room, private terrace garden, and home automation.',
        amenities: ['100% Power Backup', 'Infinity Swimming Pool', 'Clubhouse & Squash Court', 'EV Charging Station', 'Multi-tier Security', 'Private Terrace'],
      },
      {
        title: 'Prestige Boulevard Smart Residence',
        price: 65000,
        listingType: 'rent',
        propertyType: 'Premium Apartment',
        status: 'active',
        featured: true,
        address: {
          street: 'ECC Road, Whitefield',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560066',
          neighborhood: 'ITPL & Outer Ring Corridor',
        },
        specs: {
          beds: 3,
          baths: 3.0,
          sqft: 1850,
          lotSize: 'N/A',
          yearBuilt: 2023,
          garageSpaces: 2,
        },
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        ],
        agent: {
          id: agentVikram._id.toString(),
          name: 'Vikram Malhotra',
          agency: 'EstateHub Prime Realty Group',
          phone: '+91 98450 11980',
          email: 'agent@demo.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        },
        agentId: agentVikram._id,
        description: 'Fully furnished 3 BHK home inside Prestige gated enclave. Smart door lock, VRV air conditioning, and clubhouse membership included.',
        amenities: ['Fully Furnished', 'Covered Parking', 'Gymnasium', 'Tennis Court', 'Piped Gas Connection'],
      },
      {
        title: 'Worli Sea-Facing Grand Apartment',
        price: 45000000,
        listingType: 'sale',
        propertyType: 'Penthouse',
        status: 'active',
        featured: true,
        address: {
          street: 'Sea Face Promenade, Worli',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400018',
          neighborhood: 'Worli South Mumbai',
        },
        specs: {
          beds: 4,
          baths: 5,
          sqft: 3600,
          lotSize: 'N/A',
          yearBuilt: 2024,
          garageSpaces: 3,
        },
        images: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        ],
        agent: {
          id: agentVikram._id.toString(),
          name: 'Vikram Malhotra',
          agency: 'EstateHub Prime Realty Group',
          phone: '+91 98450 11980',
          email: 'agent@demo.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        },
        agentId: agentVikram._id,
        description: 'Ultra-exclusive sea-facing condominium in Worli with unhindered sunset views of the Arabian Sea.',
        amenities: ['Arabian Sea Views', 'Private Elevator Lobby', 'Heated Lap Pool', 'Concierge Desk'],
      },
      {
        title: 'Hinjawadi Tech Park Integrated Villa',
        price: 18500000,
        listingType: 'sale',
        propertyType: 'Villa',
        status: 'active',
        featured: false,
        address: {
          street: 'Phase 1, Hinjawadi',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411057',
          neighborhood: 'Tech Corridor',
        },
        specs: {
          beds: 4,
          baths: 4,
          sqft: 2800,
          lotSize: '2400 sqft plot',
          yearBuilt: 2023,
          garageSpaces: 2,
        },
        images: [
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        ],
        agent: {
          id: agentVikram._id.toString(),
          name: 'Vikram Malhotra',
          agency: 'EstateHub Prime Realty Group',
          phone: '+91 98450 11980',
          email: 'agent@demo.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        },
        agentId: agentVikram._id,
        description: 'Triplex independent villa with private lawn, solar power generation, and dual-car automated garage.',
        amenities: ['Private Garden', 'Solar Panels', 'Gated Security', 'Pet Friendly'],
      },
    ];

    const seededProperties = [];
    for (const p of sampleProperties) {
      let existing = await Property.findOne({ title: p.title });
      if (!existing) {
        existing = await Property.create(p);
        console.log(`  + Created property: ${p.title}`);
      }
      seededProperties.push(existing);
    }

    // 5. Seed Leads
    console.log('[Seed] Seeding customer leads & activities...');
    const sampleLeads = [
      {
        customerName: 'Rajesh K. Verma',
        phone: '+91 98450 21980',
        email: 'rajesh.verma@techcorp.in',
        assignedAgent: 'Vikram Malhotra',
        assignedAgentId: agentVikram._id,
        status: 'Site Visit',
        interestedProject: 'Aparna Cyber Heights',
        budget: 18000000,
        preferredUnitType: '3 BHK',
        nextFollowUpAt: '2026-10-28',
        city: 'Hyderabad',
        source: 'Website Enquiry',
      },
      {
        customerName: 'Ananya S. Iyer',
        phone: '+91 98840 91822',
        email: 'ananya.iyer@finadvisors.com',
        assignedAgent: 'Pooja Hegde',
        status: 'Negotiation',
        interestedProject: 'Prestige Tech Vista',
        budget: 15000000,
        preferredUnitType: '3 BHK + Maid',
        nextFollowUpAt: '2026-10-26',
        city: 'Bengaluru',
        source: 'Direct Portal',
      },
      {
        customerName: 'Amitabh Sen',
        phone: '+91 99201 44510',
        email: 'amitabh.sen@senassociates.in',
        assignedAgent: 'Vikram Malhotra',
        assignedAgentId: agentVikram._id,
        status: 'Booking',
        interestedProject: 'Godrej Horizon Marina',
        budget: 45000000,
        preferredUnitType: '4 BHK Sea View',
        nextFollowUpAt: '2026-10-27',
        city: 'Mumbai',
        source: 'Broker Referral',
      },
      {
        customerName: 'Divya N. Nair',
        phone: '+91 97411 88320',
        email: 'divya.nair@biotechlab.org',
        assignedAgent: 'Pooja Hegde',
        status: 'Qualified',
        interestedProject: 'Casagrand First City',
        budget: 13000000,
        preferredUnitType: '2 BHK',
        nextFollowUpAt: '2026-10-29',
        city: 'Bengaluru',
        source: 'Social Ad Campaign',
      },
    ];

    for (const l of sampleLeads) {
      let existingLead = await Lead.findOne({ phone: l.phone });
      if (!existingLead) {
        existingLead = await Lead.create(l);
        console.log(`  + Created lead: ${l.customerName} (${l.status})`);
        await LeadActivity.create({
          leadId: existingLead._id,
          actorId: agentVikram._id,
          activityType: 'note',
          description: `Initial client inquiry logged for ${l.interestedProject}`,
          newStatus: l.status,
        });
      }
    }

    // 6. Seed Site Visits
    console.log('[Seed] Seeding site visits...');
    const sampleVisits = [
      {
        clientName: 'Rajesh K. Verma',
        phone: '+91 98450 21980',
        email: 'rajesh.verma@techcorp.in',
        project: 'Aparna Cyber Heights, Financial Dist',
        agent: 'Vikram Malhotra',
        assignedAgentId: agentVikram._id,
        scheduledAt: new Date('2026-10-28T11:00:00Z'),
        timeSlot: 'Morning (11:00 AM)',
        status: 'Confirmed',
        notes: 'Client interested in top 5 floors tower A.',
      },
      {
        clientName: 'Priya Sharma',
        customerId: customerPriya._id,
        phone: '+91 98451 12345',
        email: 'customer@demo.com',
        project: 'The Skyview Luxury Penthouse',
        agent: 'Vikram Malhotra',
        assignedAgentId: agentVikram._id,
        scheduledAt: new Date('2026-10-30T10:00:00Z'),
        timeSlot: 'Morning (10:00 AM - 1:00 PM)',
        status: 'Requested',
        notes: 'Priya requested weekend walk-through.',
      },
    ];

    for (const v of sampleVisits) {
      let existingVisit = await SiteVisit.findOne({ clientName: v.clientName, project: v.project });
      if (!existingVisit) {
        await SiteVisit.create(v);
        console.log(`  + Created site visit: ${v.clientName} for ${v.project}`);
      }
    }

    // 7. Seed Sample Booking & Payment
    console.log('[Seed] Seeding sample booking...');
    let existingBooking = await Booking.findOne({ bookingReference: 'BK-50101' });
    if (!existingBooking) {
      existingBooking = await Booking.create({
        bookingReference: 'BK-50101',
        clientName: 'Amitabh Sen',
        project: 'Godrej Horizon Marina',
        unit: 'T-2201',
        agreedPrice: 45000000,
        tokenAmount: 2500000,
        status: 'Confirmed',
        notes: 'Token booking received and executed.',
      });
      console.log('  + Created booking: BK-50101');

      await Payment.create({
        bookingId: existingBooking._id,
        amount: 2500000,
        paymentType: 'token',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'TXN-MUM-89211',
        status: 'paid',
        recordedBy: adminUser._id,
        notes: 'Advance token transfer verified by accounts.',
      });
      console.log('  + Recorded payment for BK-50101: ₹25,00,000');
    }

    console.log('[Seed] Database seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
}

seed();
