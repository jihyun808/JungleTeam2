// ----------------------------
// Helper function to format date as YYYY-MM-DD
// ----------------------------
function formatDate(date) {
    const year = date.getFullYear(); // 연도
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0~11) → 1~12, 두 자리로 패딩
    const day = String(date.getDate()).padStart(2, '0'); // 일, 두 자리 패딩
    return `${year}-${month}-${day}`; // YYYY-MM-DD 형식 반환
}

// ----------------------------
// Data Mappings
// ----------------------------
// 팀별 홈 구장 매핑
const teamStadiumMap = {
    'LG 트윈스': '잠실', '두산 베어스': '잠실', '롯데 자이언츠': '사직',
    'KIA 타이거즈': '광주', '삼성 라이온즈': '대구', 'SSG 랜더스': '문학',
    'KT 위즈': '수원', '키움 히어로즈': '고척', 'NC 다이노스': '창원', '한화 이글스': '대전'
};

// 팀별 로고 이미지 경로 매핑
const teamLogoMap = {
    'LG 트윈스': '로고 사진 폴더/엘지 로고.png',
    '두산 베어스': '로고 사진 폴더/두산 로고.png',
    '롯데 자이언츠': '로고 사진 폴더/롯데_자이언츠_로고.png',
    'KIA 타이거즈': '로고 사진 폴더/기아 로고.png',
    '삼성 라이온즈': '로고 사진 폴더/삼성라이온즈 로고.png',
    'SSG 랜더스': '로고 사진 폴더/쓱 로고.png',
    'KT 위즈': '로고 사진 폴더/KT 로고.png',
    'NC 다이노스': '로고 사진 폴더/엔씨 로고.png',
    '한화 이글스': '로고 사진 폴더/한화 로고.jpg',
    '키움 히어로즈': '로고 사진 폴더/키움 로고.jpg'
};



// ----------------------------
// Schedule Generator
// ----------------------------
function generateSchedule(weeksToGenerate) {
    const allTeams = Object.keys(teamStadiumMap); // 모든 팀 목록
    const gameTimes = ['17:00', '18:30']; // 경기 시간 선택지

    const schedule = [];
    let currentDate = new Date();

    // 다음 화요일부터 시작
    while (currentDate.getDay() !== 2) { // 0:일, 1:월, 2:화
        currentDate.setDate(currentDate.getDate() + 1);
    }

    for (let i = 0; i < weeksToGenerate; i++) {
        // 평일 5경기 매치업 생성 (팀 랜덤 배정)
        let availableTeams = [...allTeams].sort(() => Math.random() - 0.5);
        const matchups = [];
        for(let k = 0; k < 5; k++) {
            matchups.push([availableTeams.pop(), availableTeams.pop()]);
        }

        // 3일 연속 경기
        for (let day = 0; day < 3; day++) {
            matchups.forEach(matchup => {
                schedule.push({
                    date: formatDate(currentDate),
                    time: gameTimes[Math.floor(Math.random() * gameTimes.length)],
                    home: matchup[0],
                    away: matchup[1],
                    stadium: teamStadiumMap[matchup[0]]
                });
            });
            currentDate.setDate(currentDate.getDate() + 1); // 날짜 증가
        }

        currentDate.setDate(currentDate.getDate() + 1); // 휴식일

        // 주말 5경기 매치업 생성
        let weekendTeams = [...allTeams].sort(() => Math.random() - 0.5);
        const weekendMatchups = [];
        for(let k = 0; k < 5; k++) {
            weekendMatchups.push([weekendTeams.pop(), weekendTeams.pop()]);
        }

        // 3일 연속 주말 경기
        for (let day = 0; day < 3; day++) {
             if (currentDate.getDay() === 1) { // 월요일이면 하루 건너뜀
                currentDate.setDate(currentDate.getDate() + 1);
            }
            weekendMatchups.forEach(matchup => {
                schedule.push({
                    date: formatDate(currentDate),
                    time: gameTimes[Math.floor(Math.random() * gameTimes.length)],
                    home: matchup[0],
                    away: matchup[1],
                    stadium: teamStadiumMap[matchup[0]]
                });
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedule; // 전체 일정 반환
}

const games = generateSchedule(2); // 2주치 일정 생성

// ----------------------------
// Render Function (HTML 출력)
// ----------------------------
function render(list) {
    const mainContainer = document.getElementById('scheduleList'); // 출력할 컨테이너
    if (!mainContainer) return;
    mainContainer.innerHTML = '';

    // 데이터가 없으면 안내 문구 표시
    if (list.length === 0) {
        mainContainer.innerHTML = '<p class="text-gray-500 text-center py-8">선택한 조건에 맞는 경기가 없습니다.</p>';
        return;
    }

    // 날짜별로 경기 묶기
    const gamesByDate = list.reduce((acc, game) => {
        (acc[game.date] = acc[game.date] || []).push(game);
        return acc;
    }, {});

    const sortedDates = Object.keys(gamesByDate).sort(); // 날짜 오름차순 정렬

    sortedDates.forEach(date => {
        const d = new Date(date);
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()];

        // 날짜 헤더 생성
        const dateHeader = document.createElement('h2');
        dateHeader.className = 'text-2xl font-bold mt-8 mb-4 pb-2 border-b-2 border-gray-200';
        dateHeader.textContent = `${date} (${dayOfWeek})`;
        mainContainer.appendChild(dateHeader);

        // 경기 카드 그리드 컨테이너
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid grid-cols-1 md:grid-cols-5 gap-4';
        mainContainer.appendChild(gridContainer);

        // 경기 카드 생성
        gamesByDate[date].forEach(g => {
            const card = document.createElement('div');
            card.className = 'bg-white border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow';

            // 홈/어웨이 팀 로고
            const homeLogo = teamLogoMap[g.home] ? `<img src="${teamLogoMap[g.home]}" alt="${g.home}" class="w-8 h-8 object-contain">` : '<div class="w-8 h-8"></div>';
            const awayLogo = teamLogoMap[g.away] ? `<img src="${teamLogoMap[g.away]}" alt="${g.away}" class="w-8 h-8 object-contain">` : '<div class="w-8 h-8"></div>';

            // 경기 월 확인 (9월인지 체크)
            const gameDate = new Date(g.date);
            const gameMonth = gameDate.getMonth() + 1; // 1~12월
            const isBookingDisabled = gameMonth === 9; // 9월이면 비활성화

            // 버튼 HTML 생성
            let buttonHtml;
            if (isBookingDisabled) {
                // 회색 비활성화 버튼
                buttonHtml = `
                  <button class="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-gray-400 text-gray-200 px-3 py-2 font-semibold cursor-not-allowed" disabled>
                    8월 14시에 오픈됩니다
                  </button>
                `;
            } else {
                // 활성화된 예매 버튼
                buttonHtml = `
                  <button class="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 font-semibold">
                    예매하기
                  </button>
                `;
            }

            card.innerHTML = `
              <div class="text-sm text-gray-500 font-medium">${g.time} - ${g.stadium} 구장</div>
              <div class="flex-grow space-y-2 flex flex-col justify-center">
                  <div class="flex items-center gap-3">
                      ${homeLogo}
                      <span class="font-bold text-lg">${g.home}</span>
                  </div>
                  <div class="flex items-center gap-3">
                      ${awayLogo}
                      <span class="font-bold text-lg">${g.away}</span>
                  </div>
              </div>
              ${buttonHtml}
            `;

            // 예매 가능한 경우에만 클릭 이벤트 추가
            if (!isBookingDisabled) {
                card.querySelector('button').addEventListener('click', () => {
                    window.location.href = `seat.html?stadium=${encodeURIComponent(g.stadium)}`;
                });
            }
            
            gridContainer.appendChild(card);
        });
    });
}

// ----------------------------
// Filters 적용
// ----------------------------
function applyFilters() {
  const team = document.getElementById('teamFilter').value;
  const stadium = document.getElementById('stadiumFilter').value;
  const date = document.getElementById('dateFilter').value;

  let filtered = games.slice(); // 원본 복사

  if (team) filtered = filtered.filter(g => g.home===team || g.away===team);
  if (stadium) filtered = filtered.filter(g => g.stadium===stadium);
  if (date) filtered = filtered.filter(g => g.date===date);

  render(filtered); // 필터 적용 후 렌더링
}

// ----------------------------
// DOMContentLoaded 이벤트
// ----------------------------
document.addEventListener('DOMContentLoaded', () => {
  render(games); // 초기 렌더링

  // 필터 이벤트 연결
  ['teamFilter','stadiumFilter','dateFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });

  // 필터 초기화 버튼
  const reset = document.getElementById('resetFilters');
  if (reset) reset.addEventListener('click', () => {
    ['teamFilter','stadiumFilter','dateFilter'].forEach(id => {
      const el = document.getElementById(id);
      if (el.tagName.toLowerCase()==='select') el.selectedIndex = 0;
      if (el.tagName.toLowerCase()==='input') el.value = '';
    });
    render(games); // 전체 경기 다시 렌더링
  });
});
