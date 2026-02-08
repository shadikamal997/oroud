import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive seed for Jordanian Areas
 * Based on real neighborhoods in each city
 */
const jordanianAreas = {
  Amman: [
    'Abdoun',
    'Sweifieh',
    'Khalda',
    'Jabal Amman',
    'Dabouq',
    'Tlaa Al Ali',
    'Marka',
    'Shmeisani',
    'Gardens',
    'Deir Ghbar',
    'Abdali',
    'Wehdat',
    'Tabarbour',
    'Rabyeh',
    'Um Uthaina',
    'Tla al-Ali',
    'Jubeiha',
    'Marj Al Hamam',
    'Abu Nseir',
    'Sweileh',
  ],
  Irbid: [
    'Downtown',
    'University District',
    'Husn',
    'Ramtha',
    'Al Hashemi',
    'Al Omari',
    'Malka',
    'New Irbid',
    'Princess Rahma',
    'Al Naseem',
  ],
  Zarqa: [
    'New Zarqa',
    'Zarqa Center',
    'Jabal Tareq',
    'Russeifa',
    'Hashemite',
    'Al Azraq',
    'Al Dhahle',
  ],
  Aqaba: [
    'City Center',
    'Industrial Zone',
    'Shallalah',
    'Al Rimal',
    'Tala Bay',
    'Ayla',
    'South Beach',
  ],
  Salt: [
    'Old Salt',
    'New Salt',
    'Jada',
    'Yarqa',
    'Zay',
  ],
  Madaba: [
    'City Center',
    'Mount Nebo',
    'Faisaliah',
    'South Madaba',
  ],
  Karak: [
    'City Center',
    'Karak Castle Area',
    'Al Mazar',
    'Mutah',
  ],
  Mafraq: [
    'City Center',
    'Za\'atari Area',
    'Safawi',
    'Ruwaished',
  ],
  Jerash: [
    'City Center',
    'Jerash Ruins Area',
    'Souf',
    'Burma',
  ],
  Ajloun: [
    'City Center',
    'Ajloun Castle Area',
    'Kufranja',
    'Anjara',
  ],
  Tafilah: [
    'City Center',
    'Dana Reserve Area',
    'Busayra',
  ],
  Maan: [
    'City Center',
    'Petra Area',
    'Wadi Musa',
    'Shouback',
  ],
};

async function seedAreas() {
  console.log('🌍 Starting Areas Seed...');

  try {
    // Get all cities from database
    const cities = await prisma.city.findMany();
    console.log(`✅ Found ${cities.length} cities`);

    if (cities.length === 0) {
      console.error('❌ No cities found! Please seed cities first.');
      return;
    }

    let totalAreasCreated = 0;

    for (const city of cities) {
      const areaNames = jordanianAreas[city.name] || [];

      if (areaNames.length === 0) {
        console.log(`⚠️  No areas defined for city: ${city.name}`);
        continue;
      }

      console.log(`\n📍 Seeding ${areaNames.length} areas for ${city.name}...`);

      for (const areaName of areaNames) {
        // Check if area already exists
        const existing = await prisma.area.findFirst({
          where: {
            name: areaName,
            cityId: city.id,
          },
        });

        if (existing) {
          console.log(`   ⏭️  Area "${areaName}" already exists, skipping...`);
          continue;
        }

        // Create the area
        await prisma.area.create({
          data: {
            name: areaName,
            cityId: city.id,
          },
        });

        totalAreasCreated++;
        console.log(`   ✅ Created: ${areaName}`);
      }
    }

    console.log(`\n🎉 Seed completed! Created ${totalAreasCreated} new areas.`);

    // Display summary
    const summary = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            areas: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('\n📊 Areas Summary by City:');
    summary.forEach((city) => {
      console.log(`   ${city.name}: ${city._count.areas} areas`);
    });

    const totalAreas = await prisma.area.count();
    console.log(`\n✅ Total areas in database: ${totalAreas}`);
  } catch (error) {
    console.error('❌ Error seeding areas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedAreas()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
