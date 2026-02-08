import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Define cities and their areas
  const citiesWithAreas = [
    {
      cityName: 'Amman',
      areas: [
        // West Amman
        { name: 'Abdoun', zone: 'West Amman' },
        { name: 'Dabouq', zone: 'West Amman' },
        { name: 'Sweifieh', zone: 'West Amman' },
        { name: 'Khalda', zone: 'West Amman' },
        { name: 'Tlaa Al Ali', zone: 'West Amman' },
        { name: 'Um Al Summaq', zone: 'West Amman' },
        { name: 'Al Rabieh', zone: 'West Amman' },
        { name: 'Shmeisani', zone: 'West Amman' },
        { name: 'Abdali', zone: 'West Amman' },
        { name: 'Jandawil', zone: 'West Amman' },
        { name: 'Bayader', zone: 'West Amman' },
        { name: 'Marj Al Hamam', zone: 'West Amman' },
        { name: 'Naour', zone: 'West Amman' },
        { name: 'Sports City', zone: 'West Amman' },
        // Central Amman
        { name: 'Downtown', zone: 'Central Amman' },
        { name: 'Jabal Amman', zone: 'Central Amman' },
        { name: 'Jabal Al Luweibdeh', zone: 'Central Amman' },
        { name: 'Jabal Al Hussein', zone: 'Central Amman' },
        { name: 'Ras Al Ain', zone: 'Central Amman' },
        { name: 'Rainbow Street Area', zone: 'Central Amman' },
        { name: 'Zahran', zone: 'Central Amman' },
        // East Amman
        { name: 'Marka', zone: 'East Amman' },
        { name: 'Tabarbour', zone: 'East Amman' },
        { name: 'Basman', zone: 'East Amman' },
        { name: 'Al Naser', zone: 'East Amman' },
        { name: 'Al Yarmouk', zone: 'East Amman' },
        { name: 'Tariq', zone: 'East Amman' },
        { name: 'Uhod', zone: 'East Amman' },
        // South Amman
        { name: 'Sahab', zone: 'South Amman' },
        { name: 'Al Muqabalin', zone: 'South Amman' },
        { name: 'Abu Alanda', zone: 'South Amman' },
        { name: 'Al Qweismeh', zone: 'South Amman' },
        { name: 'Al Jwaideh', zone: 'South Amman' },
        { name: 'Al Bunayyat', zone: 'South Amman' },
        { name: 'Um Qusayr', zone: 'South Amman' },
        { name: 'Al Ruqaim', zone: 'South Amman' },
      ],
    },
    {
      cityName: 'Aqaba',
      areas: [
        // Urban
        { name: 'Aqaba City Center', zone: 'Urban' },
        { name: 'Al Rimal', zone: 'Urban' },
        { name: 'Al Shalaleh', zone: 'Urban' },
        { name: 'Al Rawda', zone: 'Urban' },
        { name: 'Karama Area', zone: 'Urban' },
        { name: 'Al Alamiyah', zone: 'Urban' },
        { name: 'Seven Residential Area', zone: 'Urban' },
        // Coastal
        { name: 'South Beach', zone: 'Coastal' },
        { name: 'Ayla Area', zone: 'Coastal' },
        { name: 'Marina Area', zone: 'Coastal' },
        { name: 'Hotel District', zone: 'Coastal' },
        // Nearby
        { name: 'Al Bayda', zone: 'Nearby' },
        { name: 'Al Burj', zone: 'Nearby' },
        { name: 'Al Ghal', zone: 'Nearby' },
        { name: 'Al Humaymah Al Jadidah', zone: 'Nearby' },
        { name: 'Al Muzaqqar', zone: 'Nearby' },
      ],
    },
    {
      cityName: 'Zarqa',
      areas: [
        { name: 'Zarqa City Center', zone: null },
        { name: 'Rusaifah', zone: null },
        { name: 'Hittin', zone: null },
        { name: 'Al Zarqa Al Jadidah', zone: null },
        { name: 'Al Jabal Al Akhdar', zone: null },
      ],
    },
    {
      cityName: 'Irbid',
      areas: [
        { name: 'Irbid City Center', zone: null },
        { name: 'University Street', zone: null },
        { name: 'Al Husn', zone: null },
        { name: 'Al Ramtha', zone: null },
        { name: 'Beit Ras', zone: null },
      ],
    },
    {
      cityName: 'Salt',
      areas: [
        { name: 'Salt Downtown', zone: null },
        { name: 'Al Salam', zone: null },
        { name: 'Wadi Al Akrad', zone: null },
        { name: 'Al Salt Al Jadidah', zone: null },
      ],
    },
    {
      cityName: 'Madaba',
      areas: [
        { name: 'Madaba City Center', zone: null },
        { name: 'Old Town', zone: null },
        { name: 'Al Faisaliyah', zone: null },
        { name: 'Mount Nebo Area', zone: null },
      ],
    },
    {
      cityName: 'Karak',
      areas: [
        { name: 'Karak City Center', zone: null },
        { name: 'Al Mazar', zone: null },
        { name: 'Al Qatraneh', zone: null },
        { name: 'Karak Castle Area', zone: null },
      ],
    },
    {
      cityName: 'Mafraq',
      areas: [
        { name: 'Mafraq City Center', zone: null },
        { name: 'Al Manshiyah', zone: null },
        { name: 'Al Badia', zone: null },
        { name: 'Safawi', zone: null },
      ],
    },
    {
      cityName: 'Jerash',
      areas: [
        { name: 'Jerash City Center', zone: null },
        { name: 'Ruins Area', zone: null },
        { name: 'Souf', zone: null },
        { name: 'Burma', zone: null },
      ],
    },
    {
      cityName: 'Ajloun',
      areas: [
        { name: 'Ajloun City Center', zone: null },
        { name: 'Ajloun Castle Area', zone: null },
        { name: 'Anjara', zone: null },
        { name: 'Sakeb', zone: null },
      ],
    },
    {
      cityName: 'Tafilah',
      areas: [
        { name: 'Tafilah City Center', zone: null },
        { name: 'Dana', zone: null },
        { name: 'Bseera', zone: null },
        { name: 'Ais', zone: null },
      ],
    },
    {
      cityName: 'Maan',
      areas: [
        { name: 'Maan City Center', zone: null },
        { name: 'Al Shawbak', zone: null },
        { name: 'Al Hussein', zone: null },
        { name: 'Petra Area', zone: null },
        { name: 'Wadi Musa', zone: null },
      ],
    },
  ];

  // Seed cities and areas
  for (const cityData of citiesWithAreas) {
    console.log(`📍 Seeding city: ${cityData.cityName}`);

    // Upsert city
    const city = await prisma.city.upsert({
      where: { name: cityData.cityName },
      update: {},
      create: { name: cityData.cityName },
    });

    console.log(`   ✓ City "${city.name}" ready (ID: ${city.id})`);

    // Upsert areas for this city
    let areaCount = 0;
    for (const areaData of cityData.areas) {
      // Check if area already exists
      const existingArea = await prisma.area.findFirst({
        where: {
          name: areaData.name,
          cityId: city.id,
        },
      });

      if (existingArea) {
        // Update existing area
        await prisma.area.update({
          where: { id: existingArea.id },
          data: { zone: areaData.zone },
        });
      } else {
        // Create new area
        await prisma.area.create({
          data: {
            name: areaData.name,
            cityId: city.id,
            zone: areaData.zone,
          },
        });
      }
      areaCount++;
    }

    console.log(`   ✓ ${areaCount} areas seeded for ${cityData.cityName}\n`);
  }

  // Create sample users for testing
  console.log('👤 Seeding sample users...\n');

  const sampleUsers = [
    {
      phone: '+962791234567',
      role: UserRole.USER,
    },
    {
      phone: '+962799999999',
      role: UserRole.SHOP,
    },
    {
      phone: '+962777777777',
      role: UserRole.ADMIN,
    },
  ];

  for (const userData of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { phone: userData.phone },
      update: { role: userData.role },
      create: {
        phone: userData.phone,
        role: userData.role,
        isActive: true,
      },
    });
    console.log(`   ✓ User ${user.phone} (${user.role}) ready`);
  }

  console.log('\n✅ Database seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • Cities: ${citiesWithAreas.length}`);
  console.log(
    `   • Areas: ${citiesWithAreas.reduce((sum, city) => sum + city.areas.length, 0)}`,
  );
  console.log(`   • Sample Users: ${sampleUsers.length}`);
  console.log('\n💡 Test users:');
  console.log('   • USER role: +962791234567');
  console.log('   • SHOP role: +962799999999');
  console.log('   • ADMIN role: +962777777777\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
