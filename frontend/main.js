const socket = new WebSocket('ws://localhost:3000');

// Define avatars and medals
const avatars = ['🏍️', '🏎️'];
const medalColors = ['gold', 'silver', '#cd7f32'];

// Constants
const RACE_DISTANCE = 2000; // meters
const LAP_DISTANCE = 500;   // meters per lap

// Race state
let raceOver = false;

// Show race info at top
const raceInfoDiv = document.createElement('div');
raceInfoDiv.className = 'race-info';
raceInfoDiv.innerHTML = `🏁 Race Distance: ${RACE_DISTANCE} meters`;
document.body.insertBefore(raceInfoDiv, document.getElementById('leaderboard'));

// Listen for WebSocket messages
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (!raceOver) {
        updateLeaderboard(data.racers);
    }

    if (data.raceFinished && !raceOver) {
        raceOver = true;
        showRaceFinishedBanner();
    }
});

// Handle WebSocket errors
socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});

// Update the leaderboard
function updateLeaderboard(racers) {
    const leaderboardDiv = document.getElementById('leaderboard');

    // Sort racers by distance (furthest first)
    racers.sort((a, b) => b.distance - a.distance);

    // Clear leaderboard
    leaderboardDiv.innerHTML = '';

    racers.forEach((racer, index) => {
        const racerDiv = document.createElement('div');
        racerDiv.className = 'racer';

        const avatar = avatars[racer.id % avatars.length];
        let distanceDisplay = `${racer.distance.toFixed(2)} meters`;

        let currentLap = racer.finished
            ? Math.floor(RACE_DISTANCE / LAP_DISTANCE)
            : Math.floor(racer.distance / LAP_DISTANCE) + 1;

            if (raceOver) {
                racerDiv.textContent = `${avatar} ${index + 1}. ${racer.name} - Distance: ${distanceDisplay} - Speed: ${racer.speed.toFixed(2)} m/s - Lap: ${currentLap} - Time: ${racer.totalTime ? racer.totalTime.toFixed(2) : '--'} sec`;
            } else {
                racerDiv.textContent = `${avatar} ${racer.name} - Distance: ${distanceDisplay} - Speed: ${racer.speed.toFixed(2)} m/s - Lap: ${currentLap}`;
            }

        // Color top 3 racers
        if (index < 3) {
            racerDiv.style.color = medalColors[index];
        }

        leaderboardDiv.appendChild(racerDiv);
    });
}

// Show Race Finished banner and trigger podium
function showRaceFinishedBanner() {
    const banner = document.createElement('div');
    banner.className = 'race-finished-banner';
    banner.innerHTML = '🏁 Race Finished!';
    document.body.insertBefore(banner, document.getElementById('leaderboard'));

    // Show podium after a small delay
    setTimeout(showPodium, 1000);
}

// Show podium winners
function showPodium() {
    const leaderboardDiv = document.getElementById('leaderboard');
    const racerElements = leaderboardDiv.getElementsByClassName('racer');

    const podiumDiv = document.createElement('div');
    podiumDiv.className = 'podium';

    const podiumText = `
        🥇 1st Place: ${racerElements[0]?.textContent.split(' - ')[0].replace(/^\d+\.\s/, '') || 'N/A'}<br>
        🥈 2nd Place: ${racerElements[1]?.textContent.split(' - ')[0].replace(/^\d+\.\s/, '') || 'N/A'}<br>
        🥉 3rd Place: ${racerElements[2]?.textContent.split(' - ')[0].replace(/^\d+\.\s/, '') || 'N/A'}
    `;

    podiumDiv.innerHTML = podiumText;
    document.body.insertBefore(podiumDiv, leaderboardDiv.nextSibling);
}
