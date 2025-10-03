

export const initialTournaments = [
    {
        id: 1,
        name: "Knight's Conquest",
        status: 'ongoing',
        type: 'championship',
        participants: 40,
        maxParticipants:40,
        prizePool: 0,
        startDate: '2025-09-09',
        description: 'IPL-like Franchise based featured league tournament of IISER TVM.',
        icon: '👑',
        isFeatured: true // Special flag for unique tournaments
    },
    {
        id: 2,
        name: 'Rook Rally Blitz',
        status: 'registration',
        type: 'blitz',
        participants: 12,
        maxParticipants: 32,
        prizePool: 500,
        startDate: '2025-11-15',
        description: 'A rapid-fire blitz challenge. Move fast or be crushed.',
        icon: '♜',
        isFeatured: false
    },
    {
        id: 5,
        name: 'Queen\'s Gambit Qualifier',
        status: 'scheduled',
        type: 'standard',
        participants: 100,
        maxParticipants: 128,
        prizePool: 5000,
        startDate: '2025-11-20',
        description: 'A large qualifier for the major championship.',
        icon: '♛',
        isFeatured: false
    },
    {
        id: 6,
        name: 'October Rapid Fire',
        status: 'registration',
        type: 'rapid',
        participants: 45,
        maxParticipants: 64,
        prizePool: 800,
        startDate: '2025-10-25',
        description: 'Last chance to register for the monthly rapid tournament.',
        icon: '♞',
        isFeatured: false
    },
    {
        id: 3,
        name: 'The King\'s Gambit Open',
        status: 'completed',
        type: 'standard',
        participants: 64,
        maxParticipants: 64,
        prizePool: 10000,
        startDate: '2025-08-01',
        description: 'A prestigious past event with legendary winners.',
        icon: '♚',
        isFeatured: false
    },
    {
        id: 7,
        name: 'Summer Chess Championship',
        status: 'completed',
        type: 'standard',
        participants: 150,
        maxParticipants: 150,
        prizePool: 50000,
        startDate: '2025-07-15',
        description: 'The biggest tournament of the year, concluded successfully.',
        icon: '♖',
        isFeatured: false
    },
    {
        id: 4,
        name: 'Pawn Push Weekly',
        status: 'ongoing',
        type: 'standard',
        participants: 40,
        maxParticipants: 50,
        prizePool: 100,
        startDate: '2025-10-01',
        description: 'Our regular community tournament for all skill levels.',
        icon: '♟',
        isFeatured: false
    }
];