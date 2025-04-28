const socket = new WebSocket('ws://localhost:3000');

// Define a set of avatars to use
const avatars = ['🚴‍♂️', '🚴‍♀️', '🚵‍♂️', '🚵‍♀️', '🏍️', '🏎️'];
const medalColors = ['gold', 'silver', '#cd7f32'];

// Listen for messages from the server
socket.addEventListener('message', (event) => {
    const racers = JSON.parse(event.data);
    updateLeaderboard(racers);
});

// Handle WebSocket errors (registered once)
socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});

// Update the leaderboard on the page
function updateLeaderboard(racers) {
    const leaderboardDiv = document.getElementById('leaderboard');
    
    // Sort racers by distance (furthest first)
    racers.sort((a, b) => b.distance - a.distance);

    // Clear previous leaderboard
    leaderboardDiv.innerHTML = '';

    // Build new leaderboard
    racers.forEach((racer, index) => {
        const racerDiv = document.createElement('div');
        racerDiv.className = 'racer';

        // Attach an avatar based on racer ID
        const avatar = avatars[racer.id % avatars.length];

        racerDiv.textContent = `${avatar} ${index + 1}. ${racer.name} - Distance: ${racer.distance.toFixed(2)} - Speed: ${racer.speed.toFixed(2)} u/s`;

        // Add colors for top 3 racers
        if (index === 0) {
            racerDiv.style.color = medalColors[index];
        } else if (index === 1) {
            racerDiv.style.color = medalColors[index];
        } else if (index === 2) {
            racerDiv.style.color = medalColors[index];
        }

        leaderboardDiv.appendChild(racerDiv);
    });
}