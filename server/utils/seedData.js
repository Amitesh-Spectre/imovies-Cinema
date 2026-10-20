const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const generateSeats = (pricing) => {
  const rows = [
    { row: 'A', tier: 'Silver', price: pricing.silver },
    { row: 'B', tier: 'Silver', price: pricing.silver },
    { row: 'C', tier: 'Gold', price: pricing.gold },
    { row: 'D', tier: 'Gold', price: pricing.gold },
    { row: 'E', tier: 'Gold', price: pricing.gold },
    { row: 'F', tier: 'Platinum', price: pricing.platinum },
    { row: 'G', tier: 'Platinum', price: pricing.platinum },
    { row: 'H', tier: 'VIP', price: pricing.vip },
  ];

  const seats = [];
  rows.forEach((r) => {
    for (let c = 1; c <= 10; c++) {
      seats.push({
        seatNumber: `${r.row}${c}`,
        row: r.row,
        col: c,
        tier: r.tier,
        price: r.price,
        status: 'available',
      });
    }
  });
  return seats;
};

const getFutureDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@imovies.com',
      password: 'Admin@123',
      phone: '+1-555-0199',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'user@imovies.com',
      password: 'User@123',
      phone: '+1-555-0144',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    });

    console.log('[Seed] Creating cinema theatres...');
    const theatres = await Theatre.create([
      {
        name: 'PVR IMAX & 4DX Palladium',
        city: 'Mumbai',
        address: 'High Street Phoenix, Senapati Bapat Marg, Lower Parel',
        state: 'Maharashtra',
        postalCode: '400013',
        screens: [
          { screenNumber: 1, name: 'IMAX Laser Audi 1', capacity: 80, screenType: 'IMAX 3D', soundSystem: 'Dolby Atmos 12-Channel' },
          { screenNumber: 2, name: 'Audi 2 4DX', capacity: 80, screenType: '4DX', soundSystem: 'Dolby 7.1' },
          { screenNumber: 3, name: 'Audi 3 Gold Class', capacity: 80, screenType: 'Standard 2D', soundSystem: 'Dolby Atmos' },
        ],
        amenities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Luxury Seats', 'Gourmet Food Hall', 'Valet Parking'],
        contactPhone: '+91-22-40001122',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Cinepolis Grand Central',
        city: 'Delhi',
        address: 'Connaught Place, Radial Road 3',
        state: 'Delhi',
        postalCode: '110001',
        screens: [
          { screenNumber: 1, name: 'Audi 1 Macro XE', capacity: 80, screenType: 'RealD 3D', soundSystem: 'Dolby Atmos' },
          { screenNumber: 2, name: 'Audi 2 VIP Lounge', capacity: 80, screenType: 'Standard 2D', soundSystem: 'Dolby Atmos 7.1' },
        ],
        amenities: ['Dolby Atmos', 'Macro XE Giant Screen', 'Cafe Cine', 'Wheelchair Access'],
        contactPhone: '+91-11-23344556',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'INOX Megaplex Nexus Mall',
        city: 'Bengaluru',
        address: 'Koramangala 7th Block, Hosur Road',
        state: 'Karnataka',
        postalCode: '560095',
        screens: [
          { screenNumber: 1, name: 'Insignia 1', capacity: 80, screenType: 'IMAX 3D', soundSystem: 'Dolby Atmos' },
          { screenNumber: 2, name: 'Screen 2', capacity: 80, screenType: 'Standard 2D', soundSystem: 'Dolby 7.1' },
        ],
        amenities: ['Insignia 7-Star Dining', 'Dolby Atmos', 'Electric Recliners', 'Complimentary Wi-Fi'],
        contactPhone: '+91-80-41223344',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Regal Times Square Cinema',
        city: 'New York',
        address: '247 W 42nd St, Times Square',
        state: 'NY',
        postalCode: '10036',
        screens: [
          { screenNumber: 1, name: 'RPX Screen 1', capacity: 80, screenType: 'IMAX 3D', soundSystem: 'Dolby Atmos' },
          { screenNumber: 2, name: 'Screen 2', capacity: 80, screenType: 'Standard 2D', soundSystem: 'Dolby 7.1' },
        ],
        amenities: ['RPX Screen', 'Dolby Atmos', 'Full Bar', 'Mobile Concessions Pickup'],
        contactPhone: '+1-212-555-0188',
        image: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
      },
    ]);

    console.log('[Seed] Creating movies...');
    const movies = await Movie.create([
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: ['English', 'Hindi'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        rating: 8.6,
        votes: 3820,
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        status: 'now_showing',
        certification: 'UA',
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring moral dilemmas, brilliant minds, and the dawn of the nuclear era.',
        genre: ['Biography', 'Drama', 'History'],
        language: ['English'],
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        rating: 8.9,
        votes: 5210,
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        status: 'now_showing',
        certification: 'A',
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        genre: ['Animation', 'Action', 'Adventure'],
        language: ['English', 'Hindi', 'Tamil'],
        duration: 140,
        releaseDate: new Date('2023-06-02'),
        poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        rating: 8.7,
        votes: 4100,
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
        status: 'now_showing',
        certification: 'U',
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: ['English'],
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        rating: 8.7,
        votes: 6890,
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        status: 'now_showing',
        certification: 'UA',
      },
      {
        title: 'The Batman',
        description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
        genre: ['Action', 'Crime', 'Drama'],
        language: ['English', 'Hindi'],
        duration: 176,
        releaseDate: new Date('2022-03-04'),
        poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
        rating: 7.8,
        votes: 2950,
        director: 'Matt Reeves',
        cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Colin Farrell'],
        status: 'now_showing',
        certification: 'A',
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        genre: ['Action', 'Adventure', 'Drama'],
        language: ['English'],
        duration: 148,
        releaseDate: new Date('2024-11-22'),
        poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        rating: 8.4,
        votes: 1120,
        director: 'Ridley Scott',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        status: 'coming_soon',
        certification: 'A',
      },
    ]);

    console.log('[Seed] Scheduling shows across dates...');
    const showTimes = ['10:30 AM', '02:15 PM', '06:45 PM', '09:30 PM'];
    const showFormats = ['IMAX 3D', '2D', '3D'];
    const dates = [getFutureDate(0), getFutureDate(1), getFutureDate(2)];

    const createdShows = [];
    const defaultPricing = { silver: 150, gold: 220, platinum: 320, vip: 450 };

    for (const movie of movies.filter((m) => m.status === 'now_showing')) {
      for (const theatre of theatres) {
        for (const date of dates) {
          // Schedule 2 shows per day per theatre
          for (let i = 0; i < 2; i++) {
            const time = showTimes[(movie.title.length + i) % showTimes.length];
            const format = showFormats[i % showFormats.length];
            const seats = generateSeats(defaultPricing);

            // Pre-book 3 random seats for realistic experience
            seats[3].status = 'booked';
            seats[3].bookedBy = adminUser._id;
            seats[4].status = 'booked';
            seats[4].bookedBy = adminUser._id;
            seats[12].status = 'booked';
            seats[12].bookedBy = adminUser._id;

            const show = await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screenNumber: 1,
              screenName: theatre.screens[0].name,
              showDate: date,
              showTime: time,
              format,
              language: movie.language[0] || 'English',
              pricing: defaultPricing,
              seats,
              totalSeats: seats.length,
              availableSeatsCount: seats.filter((s) => s.status === 'available').length,
              status: 'active',
            });
            createdShows.push(show);
          }
        }
      }
    }

    console.log('[Seed] Creating sample user booking...');
    const sampleShow = createdShows[0];
    const sampleBooking = await Booking.create({
      bookingId: 'IMV-SEED01',
      user: demoUser._id,
      show: sampleShow._id,
      movie: sampleShow.movie,
      theatre: sampleShow.theatre,
      seats: [
        { seatNumber: 'D4', tier: 'Gold', price: 220 },
        { seatNumber: 'D5', tier: 'Gold', price: 220 },
      ],
      subtotal: 440,
      convenienceFee: 30,
      tax: 22,
      totalAmount: 492,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-SEED9988',
      qrCode: `IMOVIES-VERIFY-IMV-SEED01-${demoUser._id}`,
    });

    await Payment.create({
      transactionId: 'TXN-SEED9988',
      booking: sampleBooking._id,
      user: demoUser._id,
      amount: 492,
      currency: 'USD',
      paymentMethod: 'Credit Card',
      status: 'success',
    });

    await Notification.create({
      user: demoUser._id,
      title: 'Welcome to IMovies! 🍿',
      message: 'Explore trending blockbusters, select your favorite luxury seats, and book tickets instantly.',
      type: 'system',
    });

    await Notification.create({
      user: demoUser._id,
      title: 'Booking Confirmed: IMV-SEED01',
      message: 'Your tickets for Dune: Part Two are confirmed. Enjoy the show!',
      type: 'booking',
      bookingId: 'IMV-SEED01',
    });

    console.log('========================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`👤 Admin: admin@imovies.com | Password: Admin@123`);
    console.log(`👤 User:  user@imovies.com  | Password: User@123`);
    console.log(`🎬 Movies: ${movies.length}`);
    console.log(`🏛️  Theatres: ${theatres.length}`);
    console.log(`🎟️  Shows: ${createdShows.length}`);
    console.log('========================================================');
  } catch (err) {
    console.error('[Seed Error]:', err);
  } finally {
    await disconnectDB();
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
