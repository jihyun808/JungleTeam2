// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate a dynamic schedule
function generateSchedule(days) {
    const teams = ['LG 트윈스', '두산 베어스', '롯데 자이언츠', 'KIA 타이거즈', '삼성 라이온즈', 'SSG 랜더스', 'KT 위즈', '키움 히어로즈', 'NC 다이노스', '한화 이글스'];
    const stadiums = ['잠실', '사직', '고척', '대전', '광주', '수원', '창원', '대구', '문학'];
    const gameTimes = ['14:00', '17:00', '18:30'];
    
    const schedule = [];
    let currentDate = new Date();

    for (let i = 0; i < days; i++) {
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Skip Mondays (getDay() returns 1 for Monday)
        if (currentDate.getDay() === 1) {
            continue;
        }

        // Generate 5 games for the current date
        for (let j = 0; j < 5; j++) {
            // Ensure home and away teams are different
            let homeTeam = teams[Math.floor(Math.random() * teams.length)];
            let awayTeam = teams[Math.floor(Math.random() * teams.length)];
            while (homeTeam === awayTeam) {
                awayTeam = teams[Math.floor(Math.random() * teams.length)];
            }

            schedule.push({
                date: formatDate(currentDate),
                time: gameTimes[Math.floor(Math.random() * gameTimes.length)],
                home: homeTeam,
                away: awayTeam,
                stadium: stadiums[Math.floor(Math.random() * stadiums.length)]
            });
        }
    }
    return schedule;
}

// We will replace the old static 'games' with our generated schedule
const games = generateSchedule(14); // Generate 2 weeks of games

function render(list) {
  const box = document.getElementById('scheduleList');
  if (!box) return;
  box.innerHTML = '';
  if (list.length === 0) {
      box.innerHTML = '<p class="text-gray-500 col-span-full text-center">선택한 조건에 맞는 경기가 없습니다.</p>';
      return;
  }
  list.forEach(g => {
    const card = document.createElement('div');
    card.className = 'bg-white border rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow'; // Added shadow
    card.innerHTML = `
      <div class="text-sm text-gray-500 font-medium">${g.date} ${g.time}</div>
      <div class="font-bold text-lg">${g.home} <span class="font-normal text-gray-600">vs</span> ${g.away}</div>
      <div class="text-sm text-gray-600">${g.stadium} 구장</div>
      <button class="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 font-semibold">
        예매하기
      </button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      alert('좌석 선택 페이지로 이동합니다 (데모)');
    });
    box.appendChild(card);
  });
}

function applyFilters() {
  const team = document.getElementById('teamFilter').value;
  const stadium = document.getElementById('stadiumFilter').value;
  const date = document.getElementById('dateFilter').value;
  
  let filtered = games.slice(); // Use the globally generated games

  if (team) filtered = filtered.filter(g => g.home===team || g.away===team);
  if (stadium) filtered = filtered.filter(g => g.stadium===stadium);
  if (date) filtered = filtered.filter(g => g.date===date);
  
  render(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  render(games); // Render the initially generated games
  ['teamFilter','stadiumFilter','dateFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });
  const reset = document.getElementById('resetFilters');
  if (reset) reset.addEventListener('click', () => {
    ['teamFilter','stadiumFilter','dateFilter'].forEach(id => {
      const el = document.getElementById(id);
      if (el.tagName.toLowerCase()==='select') el.selectedIndex = 0;
      if (el.tagName.toLowerCase()==='input') el.value = '';
    });
    render(games); // Re-render the full generated list
  });
});