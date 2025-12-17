type LatestWinnerData = {
    thumbnail: string;
    title: string;
    gameType: string;
    userName: string;
    userType: 'Player' | 'Guest';
    winAmmount: number;
    coinType: 'sweep-coin' | 'gold-coin';
    color: string;
};

// Helper function to generate random win amount based on coin type
const generateWinAmount = (coinType: 'sweep-coin' | 'gold-coin'): number => {
    if (coinType === 'sweep-coin') {
        // Sweep coin: 40-500 range
        return Math.floor(Math.random() * (500 - 40 + 1)) + 40;
    } else {
        // Gold coin: 600-20000 range
        return Math.floor(Math.random() * (20000 - 600 + 1)) + 600;
    }
};

// Helper function to get random element from array
const getRandomElement = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

// Game data for randomization
const gameTitles = [
    'Yolo', 'Crab King III', 'Blue Dragon', 'Ultra Panda', 'Life of Luxury', 
    'Crystal Clovers', 'Mega Fortune', 'Diamond Rush', 'Lucky Stars', 'Golden Gates',
    'Treasure Hunt', 'Mystic Moon', 'Cosmic Cash', 'Royal Flush', 'Jackpot Jester'
];

const gameTypes = [
    'Exclusive game', 'Bonus game', 'Download & Play', 'Exclusive', 'Bonus games',
    'Premium game', 'Featured game', 'New game', 'Popular game', 'Classic game', 'Signature game'
];

const userNames = [
    'Alex M', 'Jordan K', 'Casey R', 'Taylor B', 'Morgan L', 'Riley S',
    'Avery T', 'Quinn P', 'Sage W', 'River D', 'Phoenix C', 'Skylar N',
    'Blake A', 'Cameron F', 'Drew H', 'Emery J', 'Finley G', 'Harper E',
    'Hayden M', 'Indigo R', 'Jaden L', 'Kai S', 'Lane T', 'Marlowe P',
    'Nico W', 'Oakley D', 'Parker C', 'Reese N', 'Rowan A', 'Sawyer F',
    'Spencer H', 'Sterling J', 'Tanner G', 'Vale E', 'Wren M', 'Zion R',
    'Aria L', 'Bella S', 'Chloe T', 'Diana P', 'Elena W', 'Fiona D',
    'Grace C', 'Hazel N', 'Iris A', 'Jade F', 'Kira H', 'Luna J',
    'Maya G', 'Nora E', 'Opal M', 'Piper R', 'Quinn L', 'Ruby S',
    'Stella T', 'Tara P', 'Uma W', 'Vera D', 'Willow C', 'Xara N',
    'Yara A', 'Zara F', 'Aiden H', 'Blake J', 'Carter G', 'Dylan E',
    'Ethan M', 'Felix R', 'Gavin L', 'Hunter S', 'Ian T', 'Jake P',
    'Kyle W', 'Logan D', 'Mason C', 'Noah N', 'Owen A', 'Parker F',
    'Quinn H', 'Ryan J', 'Sean G', 'Tyler E', 'Vince M', 'Wade R',
    'Xavier L', 'Zane S', 'Ace T', 'Beau P', 'Cole W', 'Dean D',
    'Eli C', 'Finn N', 'Gage A', 'Holt F', 'Ivan H', 'Jax J',
    'Kai G', 'Leo E', 'Max M', 'Nash R', 'Otis L', 'Pax S',
    'Rex T', 'Sam P', 'Tate W', 'Vic D', 'Wes C', 'Zoe N'
];

const colors = [
    'blue', 'orange', 'green', 'yellow', 'purple', 'fuchsia', 'lime', 'rose',
    'indigo', 'pink', 'teal', 'cyan', 'emerald', 'violet', 'amber', 'red'
];

const thumbnails = [
    '/game-thumbnails/1.jpg', '/game-thumbnails/2.jpg', '/game-thumbnails/3.jpg',
    '/game-thumbnails/4.jpg', '/game-thumbnails/5.jpg', '/game-thumbnails/6.jpg',
    '/game-thumbnails/7.jpg', '/game-thumbnails/8.jpg', '/game-thumbnails/9.jpg',
    '/game-thumbnails/10.jpg', '/game-thumbnails/11.jpg', '/game-thumbnails/12.jpg',
    '/game-thumbnails/13.jpg', '/game-thumbnails/14.jpg', '/game-thumbnails/15.jpg',
    '/game-thumbnails/16.jpg'
];

// Generate random latest winners data
const generateRandomWinners = (count: number): LatestWinnerData[] => {
    const winners: LatestWinnerData[] = [];
    
    for (let i = 0; i < count; i++) {
        const coinType = Math.random() > 0.5 ? 'sweep-coin' : 'gold-coin';
        const userType = Math.random() > 0.3 ? 'Player' : 'Guest'; // 70% players, 30% guests
        
        winners.push({
            thumbnail: getRandomElement(thumbnails),
            title: getRandomElement(gameTitles),
            gameType: getRandomElement(gameTypes),
            userName: getRandomElement(userNames),
            userType: userType as 'Player' | 'Guest',
            winAmmount: generateWinAmount(coinType),
            coinType: coinType,
            color: getRandomElement(colors),
        });
    }
    
    return winners;
};

// Generate winners data lazily to prevent hydration mismatches
let _latestWinnersData: LatestWinnerData[] | null = null;

export const getLatestWinnersData = (): LatestWinnerData[] => {
    if (!_latestWinnersData) {
        _latestWinnersData = generateRandomWinners(20);
    }
    return _latestWinnersData;
};

// For backward compatibility - generate data on module load
// This ensures consistent data between server and client
export const latestWinnersData = generateRandomWinners(20);
