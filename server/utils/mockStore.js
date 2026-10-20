const bcrypt = require('bcryptjs');

// In-Memory Data Store for zero-setup local development and instant out-of-the-box demo
const getFutureDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const generateSeats = (pricing) => {
  const rows = [
    { row: 'A', tier: 'Silver', price: pricing.silver || 150 },
    { row: 'B', tier: 'Silver', price: pricing.silver || 150 },
    { row: 'C', tier: 'Gold', price: pricing.gold || 220 },
    { row: 'D', tier: 'Gold', price: pricing.gold || 220 },
    { row: 'E', tier: 'Gold', price: pricing.gold || 220 },
    { row: 'F', tier: 'Platinum', price: pricing.platinum || 320 },
    { row: 'G', tier: 'Platinum', price: pricing.platinum || 320 },
    { row: 'H', tier: 'VIP', price: pricing.vip || 450 },
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
        lockedBy: null,
        lockedSocketId: null,
        lockedAt: null,
        bookedBy: null,
      });
    }
  });
  return seats;
};

// Realistic mock records
const users = [
  {
    _id: '66a000000000000000000001',
    name: 'System Administrator',
    email: 'admin@imovies.com',
    password: '', // will be hashed below
    role: 'admin',
    phone: '+1-555-0199',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(),
  },
  {
    _id: '66a000000000000000000002',
    name: 'Alex Johnson',
    email: 'user@imovies.com',
    password: '', // will be hashed below
    role: 'user',
    phone: '+1-555-0144',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(),
  },
];

const theatres = [
  {
    _id: '66b000000000000000000001',
    name: 'PVR IMAX & 4DX Palladium',
    city: 'Mumbai',
    address: 'High Street Phoenix, Lower Parel',
    state: 'Maharashtra',
    postalCode: '400013',
    screens: [
      { screenNumber: 1, name: 'IMAX Laser Audi 1', capacity: 80, screenType: 'IMAX 3D', soundSystem: 'Dolby Atmos 12-Channel' },
      { screenNumber: 2, name: 'Audi 2 4DX', capacity: 80, screenType: '4DX', soundSystem: 'Dolby 7.1' },
    ],
    amenities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Luxury Seats', 'Gourmet Food Hall', 'Valet Parking'],
    contactPhone: '+91-22-40001122',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: '66b000000000000000000002',
    name: 'Cinepolis Grand Central',
    city: 'Delhi',
    address: 'Connaught Place, Radial Road 3',
    state: 'Delhi',
    postalCode: '110001',
    screens: [
      { screenNumber: 1, name: 'Audi 1 Macro XE', capacity: 80, screenType: 'RealD 3D', soundSystem: 'Dolby Atmos' },
    ],
    amenities: ['Dolby Atmos', 'Macro XE Giant Screen', 'Cafe Cine', 'Wheelchair Access'],
    contactPhone: '+91-11-23344556',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: '66b000000000000000000003',
    name: 'INOX Megaplex Nexus Mall',
    city: 'Bengaluru',
    address: 'Koramangala 7th Block, Hosur Road',
    state: 'Karnataka',
    postalCode: '560095',
    screens: [
      { screenNumber: 1, name: 'Insignia 1', capacity: 80, screenType: 'IMAX 3D', soundSystem: 'Dolby Atmos' },
    ],
    amenities: ['Insignia 7-Star Dining', 'Dolby Atmos', 'Electric Recliners', 'Complimentary Wi-Fi'],
    contactPhone: '+91-80-41223344',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: '66b000000000000000000004',
    name: 'Regal Times Square Cinema',
    city: 'New York',
    address: '247 W 42nd St, Times Square',
    state: 'NY',
    postalCode: '10036',
    screens: [
      { screenNumber: 1, name: 'RPX Screen 1', capacity: 80, screenType: 'IMAX 3D', soundSystem: 'Dolby Atmos' },
    ],
    amenities: ['RPX Screen', 'Dolby Atmos', 'Full Bar', 'Mobile Concessions Pickup'],
    contactPhone: '+1-212-555-0188',
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
  },
];

const movies = [
  {
    _id: '66c000000000000000000001',
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
    createdAt: new Date(),
  },
  {
    _id: '66c000000000000000000002',
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
    createdAt: new Date(),
  },
  {
    _id: '66c000000000000000000003',
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
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
    createdAt: new Date(),
  },
  {
    _id: '66c000000000000000000004',
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft to find a new home.',
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
    createdAt: new Date(),
  },
  {
    _id: '66c000000000000000000005',
    title: 'The Batman',
    description: 'Batman ventures into Gotham City\'s underworld when a sadistic killer leaves behind a trail of cryptic clues.',
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
    createdAt: new Date(),
  },
  {
    _id: '66c000000000000000000006',
    title: 'Gladiator II',
    description: 'Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered.',
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
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington'],
    status: 'coming_soon',
    certification: 'A',
    createdAt: new Date(),
  },
];

const shows = [];
const defaultPricing = { silver: 150, gold: 220, platinum: 320, vip: 450 };
const showTimes = ['10:30 AM', '02:15 PM', '06:45 PM', '09:30 PM'];
const dates = [getFutureDate(0), getFutureDate(1), getFutureDate(2)];

let showIdCounter = 1;
movies.filter((m) => m.status === 'now_showing').forEach((m) => {
  theatres.forEach((t) => {
    dates.forEach((d) => {
      [0, 1].forEach((i) => {
        const idHex = showIdCounter.toString(16).padStart(24, '0');
        showIdCounter++;
        const seats = generateSeats(defaultPricing);

        // Pre-book 2 seats
        seats[2].status = 'booked';
        seats[2].bookedBy = users[0]._id;
        seats[3].status = 'booked';
        seats[3].bookedBy = users[0]._id;

        shows.push({
          _id: idHex,
          movie: m._id,
          theatre: t._id,
          screenNumber: 1,
          screenName: t.screens[0].name,
          showDate: d,
          showTime: showTimes[(m.title.length + i) % showTimes.length],
          format: i === 0 ? 'IMAX 3D' : '2D',
          language: m.language[0],
          pricing: defaultPricing,
          seats,
          totalSeats: seats.length,
          availableSeatsCount: seats.filter((s) => s.status === 'available').length,
          status: 'active',
          createdAt: new Date(),
        });
      });
    });
  });
});

const sampleShow = shows[0];
const sampleMovie = movies[0];
const sampleTheatre = theatres[0];

const bookings = [
  {
    _id: '66e000000000000000000001',
    bookingId: 'IMV-DEMO88',
    user: users[1]._id,
    show: sampleShow._id,
    movie: sampleMovie._id,
    theatre: sampleTheatre._id,
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
    transactionId: 'TXN-DEMO8877',
    qrCode: `IMOVIES-VERIFY-IMV-DEMO88-${users[1]._id}`,
    createdAt: new Date(),
  },
];

const payments = [
  {
    _id: '66f000000000000000000001',
    transactionId: 'TXN-DEMO8877',
    booking: bookings[0]._id,
    user: users[1]._id,
    amount: 492,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    status: 'success',
    createdAt: new Date(),
  },
];

const notifications = [
  {
    _id: '660000000000000000000001',
    user: users[1]._id,
    title: 'Welcome to IMovies! 🍿',
    message: 'Explore trending blockbusters, select your favorite seats, and book tickets in seconds.',
    type: 'system',
    bookingId: null,
    read: true,
    createdAt: new Date(),
  },
  {
    _id: '660000000000000000000002',
    user: users[1]._id,
    title: 'Booking Confirmed: IMV-DEMO88',
    message: `Your booking for ${sampleMovie.title} at ${sampleTheatre.name} is confirmed!`,
    type: 'booking',
    bookingId: 'IMV-DEMO88',
    read: false,
    createdAt: new Date(),
  },
];

// Initialize password hashes
(async () => {
  users[0].password = await bcrypt.hash('Admin@123', 10);
  users[1].password = await bcrypt.hash('User@123', 10);
})();

module.exports = {
  users,
  movies,
  theatres,
  shows,
  bookings,
  payments,
  notifications,
  generateSeats,
};
