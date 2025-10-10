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
        id: 5,
        name: 'ITSAV',
        status: 'scheduled',
        type: 'Team based single round robin',
        participants: 0,
        maxParticipants: 30,
        prizePool: 0,
        startDate: 'To Be Announced',
        description: 'The ultimate test of chess supremacy. Battle of 4 teams in a 5v5 conquest. Winner takes the crown.',
        icon: '♛',
        isFeatured: false
    },
]