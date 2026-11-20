// Mock profile data. 32 profiles; 11 of them have already liked the logged-in user.
//
// PRIVACY NOTE: "likedMe" lives only in LIKED_ME_IDS on the server. It is never
// attached to a profile object and is never sent to the client. The only way a
// client learns that someone liked them is a mutual match.

export const CURRENT_USER = { id: "me", name: "You" };

const RAW = [
  ["Aanya", 21, "IIT Delhi", "Chai over coffee, always. Will beat you at Catan.", ["Board games", "Chai", "Sketching"]],
  ["Rohan", 23, "Delhi University", "Sunday cricket, weekday cooking experiments.", ["Cricket", "Cooking", "Podcasts"]],
  ["Meera", 22, "Ashoka University", "Bookshelf bigger than my room. Recommend me something.", ["Reading", "Poetry", "Thrifting"]],
  ["Kabir", 24, "Gurugram", "Weekend trekker. Currently planning Kasol.", ["Trekking", "Photography", "Guitar"]],
  ["Ishita", 20, "Jamia Millia Islamia", "Film student. Ask me about my favourite Ray movie.", ["Cinema", "Writing", "Street food"]],
  ["Arjun", 25, "Noida", "Software dev by day, amateur DJ by night.", ["Music", "Coding", "Gaming"]],
  ["Tara", 22, "BITS Pilani", "Dancer. Overthinker. Great at making playlists.", ["Dance", "Playlists", "Travel"]],
  ["Vihaan", 23, "NSUT Delhi", "Gym, gaming, and an unreasonable love for momos.", ["Fitness", "Gaming", "Momos"]],
  ["Sanya", 21, "Lady Shri Ram College", "Debate team captain. I will win this argument too.", ["Debate", "Journalism", "Coffee"]],
  ["Dev", 24, "Ghaziabad", "Learning pottery. My mugs are... abstract.", ["Pottery", "Cycling", "Cooking"]],
  ["Riya", 22, "Miranda House", "Plant parent of 14. Yes, I name them.", ["Plants", "Baking", "Yoga"]],
  ["Aditya", 26, "Delhi", "Stand-up open mics and bad puns.", ["Comedy", "Writing", "Chess"]],
  ["Naina", 20, "SRCC", "Finance nerd who secretly paints.", ["Painting", "Markets", "Brunch"]],
  ["Samar", 23, "Amity University", "Football, food and lo-fi beats.", ["Football", "Lo-fi", "Foodie"]],
  ["Kiara", 21, "Christ University", "Theatre kid forever. Ask me to monologue.", ["Theatre", "Fashion", "Karaoke"]],
  ["Veer", 25, "Gurugram", "Startup life. Will trade coffee for ideas.", ["Startups", "Running", "Coffee"]],
  ["Anika", 22, "IIIT Delhi", "ML researcher, amateur baker. Both need patience.", ["AI", "Baking", "Badminton"]],
  ["Yash", 24, "Noida", "Photographer chasing golden hour.", ["Photography", "Travel", "Bikes"]],
  ["Pooja", 23, "JNU", "Politics, poetry and parathas.", ["Poetry", "Politics", "Food"]],
  ["Karan", 22, "Delhi Technological University", "Rock climbing and bad dad jokes.", ["Climbing", "Jokes", "Anime"]],
  ["Simran", 21, "Delhi University", "Kathak practitioner. Sunsets on the terrace.", ["Kathak", "Sunsets", "Journalling"]],
  ["Neil", 26, "Delhi", "Architect. I rate cafes by their chairs.", ["Architecture", "Cafes", "Sketching"]],
  ["Zoya", 20, "Jamia Millia Islamia", "Standing on the metro platform with a book.", ["Reading", "Metro rides", "Biryani"]],
  ["Harsh", 23, "Ghaziabad", "Table tennis champ (of my hostel).", ["Table tennis", "Cooking", "Quizzing"]],
  ["Myra", 22, "St. Stephen's College", "History buff. Will drag you to every monument.", ["History", "Walks", "Chai"]],
  ["Ayaan", 24, "Noida", "Drummer. Terrible at replying fast, great at showing up.", ["Drums", "Road trips", "Cricket"]],
  ["Diya", 21, "Gargi College", "Illustrator, doodles on every napkin.", ["Illustration", "Anime", "Matcha"]],
  ["Reyansh", 25, "Delhi", "Marathon trainee. Rest days are for brunch.", ["Running", "Brunch", "Podcasts"]],
  ["Tanvi", 23, "Hindu College", "Quiz champ. Ask me anything, I dare you.", ["Quizzing", "Cinema", "Travel"]],
  ["Jai", 22, "IIT Delhi", "Robotics club. Yes, I built a coffee robot.", ["Robotics", "Coffee", "Chess"]],
  ["Nisha", 24, "Gurugram", "Designer. Opinions about fonts, strong ones.", ["Design", "Typography", "Wine"]],
  ["Om", 21, "Delhi University", "Skater boy energy, grandpa music taste.", ["Skating", "Classic rock", "Street food"]],
];

// Indices (into RAW) that have already liked the user. Spread through the deck so
// matches show up early and throughout a demo. 11 of 32.
const LIKED_ME_INDICES = new Set([1, 2, 4, 6, 9, 13, 16, 19, 22, 26, 30]);

function slug(i) {
  return `p${String(i + 1).padStart(2, "0")}`;
}

export const PROFILES = RAW.map(([name, age, place, bio, interests], i) => ({
  id: slug(i),
  name,
  age,
  place,
  bio,
  interests,
  photo: `/api/avatar/${slug(i)}`,
}));

/** Server-only. NEVER send this to a client. */
export const LIKED_ME_IDS = new Set(
  RAW.map((_, i) => i).filter((i) => LIKED_ME_INDICES.has(i)).map(slug)
);
