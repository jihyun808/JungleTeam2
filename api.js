// 1. 뉴스 데이터 가져오기 API 
document.addEventListener('DOMContentLoaded', function () {
    
    // 뉴스 데이터 가져오기 함수
    function loadNews() {
        // HTML의 뉴스 섹션에서 뉴스 카드들이 있는 그리드 컨테이너를 찾음
        const newsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6');
        
        if (!newsContainer) {
            console.error('뉴스 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 로딩 표시
        newsContainer.innerHTML = '<div class="col-span-3 text-center py-8"><div class="animate-pulse"><div class="inline-block w-8 h-8 bg-blue-600 rounded-full"></div><p class="mt-2 text-gray-600">뉴스를 불러오는 중...</p></div></div>';
        
        // RSS 코드를 JSON으로 변환
        const rssUrl = 'https://www.khan.co.kr/rss/rssdata/kh_sports.xml';
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        fetch(proxyUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                newsContainer.innerHTML = '';
                
                // RSS 피드에서 아이템 가져오기 (최대 3개)
                const items = data.items || [];
                items.slice(0, 3).forEach((item, index) => {
                    const newsCard = document.createElement('div');
                    newsCard.className = 'overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-md bg-white rounded-lg';
                    
                    // 기본 이미지 배열 (실제 이미지가 없을 경우 사용)
                    const defaultImages = [
                        'https://via.placeholder.com/400x200/3B82F6/ffffff?text=KBO+News+1',
                        'https://via.placeholder.com/400x200/10B981/ffffff?text=KBO+News+2',
                        'https://via.placeholder.com/400x200/F59E0B/ffffff?text=KBO+News+3'
                    ];
                    
                    newsCard.innerHTML = `
                        <div class="relative h-48 overflow-hidden">
                            <img src="${defaultImages[index] || defaultImages[0]}" 
                                 alt="${item.title}" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <div class="absolute top-3 left-3">
                                <span class="bg-white/90 text-gray-800 font-medium px-2 py-1 rounded text-sm">경향신문</span>
                            </div>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">${item.title}</h3>
                            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${item.description ? item.description.substring(0, 100) + '...' : '내용을 불러올 수 없습니다.'}</p>
                            <div class="flex justify-between items-center text-xs text-gray-500">
                                <span>${new Date(item.pubDate).toLocaleDateString('ko-KR')}</span>
                                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-medium group-hover:underline">자세히 보기</a>
                            </div>
                        </div>
                    `;
                    newsContainer.appendChild(newsCard);
                });
                
                // 데이터가 없는 경우
                if (items.length === 0) {
                    loadBackupNews();
                }
            })
            .catch(error => {
                console.error('뉴스 로딩 에러:', error);
                loadBackupNews();
            });
    }
    
    // 백업용 뉴스 데이터 (RSS가 실패할 경우 사용)
    function loadBackupNews() {
        const newsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6');
        if (!newsContainer) return;
        
        const backupNews = [
            {
                title: "'100승 감독' 김태형, 롯데와 3년 24억원 계약",
                content: "프로야구 롯데 자이언츠가 제21대 감독으로 김태형(56) 전 두산 베어스 감독을 선임했다.",
                image: "https://via.placeholder.com/400x200/3B82F6/ffffff?text=KBO+News+1",
                date: "2024년 8월 16일"
            },
            {
                title: "KIA, 소크라테스와 총액 120만 달러에 재계약",
                content: "KIA 타이거즈가 외국인 타자 소크라테스 브리토(31)와 재계약을 마쳤다.",
                image: "https://via.placeholder.com/400x200/10B981/ffffff?text=KBO+News+2",
                date: "2024년 8월 15일"
            },
            {
                title: "이정후, MLB 샌프란시스코와 6년 1억1300만달러 계약",
                content: "이정후(25)가 미국프로야구 메이저리그(MLB) 샌프란시스코 자이언츠 유니폼을 입는다.",
                image: "https://via.placeholder.com/400x200/F59E0B/ffffff?text=KBO+News+3",
                date: "2024년 8월 14일"
            }
        ];

        newsContainer.innerHTML = '';
        backupNews.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-md bg-white rounded-lg';
            newsCard.innerHTML = `
                <div class="relative h-48 overflow-hidden">
                    <img src="${news.image}" alt="${news.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute top-3 left-3">
                        <span class="bg-white/90 text-gray-800 font-medium px-2 py-1 rounded text-sm">KBO</span>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">${news.title}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${news.content}</p>
                    <div class="flex justify-between items-center text-xs text-gray-500">
                        <span>${news.date}</span>
                        <span class="text-blue-600 font-medium group-hover:underline">자세히 보기</span>
                    </div>
                </div>
            `;
            newsContainer.appendChild(newsCard);
        });
    }
    
    // 뉴스 로드 실행
    loadNews();
    
    // 10분마다 새로고침
    setInterval(loadNews, 10 * 60 * 1000);
});

// 2. 구단 순위 크롤링
document.addEventListener('DOMContentLoaded', async () => {
      const ul = document.querySelector('.list-unstyled');
      const targetUrl = "https://www.koreabaseball.com/record/teamrank/teamrankdaily.aspx"; 

      try {
        // HTML 가져오기
        const res = await fetch(targetUrl);
        const html = await res.text();

        // 문자열을 DOM 객체로 변환
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // 크롤링 대상 선택 (사이트 구조에 맞게 수정해야 함)
        const articles = doc.querySelectorAll(".tData"); // 예시 선택자

        document.addEventListener('DOMContentLoaded', async () => {
  const url = "https://www.koreabaseball.com/record/teamrank/teamrankdaily.aspx";
  
  try {
    const res = await fetch(url);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 테이블 선택
    const rows = doc.querySelectorAll(".tData tbody tr");

    const results = [];
    rows.forEach(tr => {
      const tds = tr.querySelectorAll("td");
      results.push({
        rank: tds[0].textContent.trim(),
        team: tds[1].textContent.trim(),
        games: tds[2].textContent.trim(),
        win: tds[3].textContent.trim(),
        lose: tds[4].textContent.trim(),
        draw: tds[5].textContent.trim(),
        winRate: tds[6].textContent.trim(),
        last10: tds[7].textContent.trim(),
        streak: tds[8].textContent.trim(),
        homeAway: tds[9].textContent.trim()
      });
    });

    console.log(results);

    // 화면에 출력
    const container = document.querySelector('.p-3.mb-3.bg-light.rounded');
    let ol = container.querySelector('ol.list-unstyled.mb-0');
    
    ol.innerHTML = "";
    results.forEach(row => {
        const li = document.createElement("li");
        li.textContent = `${row.rank}위 ${row.team} - 승률 ${row.winRate}, 최근10경기: ${row.last10}`;
        ol.appendChild(li);
    });

  } catch (err) {
    console.error("크롤링 에러:", err);
  }
});

        // 상위 10개만 보여주기
        articles.forEach((a, idx) => {
          if (idx < 10) {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${a.href}" target="_blank">${a.textContent}</a>`;
            ul.appendChild(li);
          }
        });

      } catch (err) {
        ul.innerHTML = "<li>불러오기 실패</li>";
        console.error(err);
      }
    });
    
console.log('기사 API 완료');

// 2. 구단 순위 크롤링
document.addEventListener('DOMContentLoaded', async () => {
    async function loadTeamRankings() {
        const targetUrl = "https://www.koreabaseball.com/record/teamrank/teamrankdaily.aspx";
        
        // 순위를 표시할 컨테이너 찾기
        const rankingContainer = document.querySelector('aside .space-y-2');
        
        if (!rankingContainer) {
            console.error('구단 순위 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        try 
            const response = await fetch(targetUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            
            // 이미지를 보면 table class="tData"이고 그 안에 tbody > tr 구조
            const table = doc.querySelector('table.tData');
            if (!table) {
                throw new Error('순위 테이블을 찾을 수 없습니다.');
            }
            
            // tbody의 tr들 선택 (thead 제외)
            const rows = table.querySelectorAll('tbody tr');
            
            if (rows.length === 0) {
                throw new Error('순위 데이터가 없습니다.');
            }
            
            const results = [];
            rows.forEach((tr, index) => {
                const tds = tr.querySelectorAll('td');
                
                // td가 충분히 있는지 확인
                if (tds.length >= 10) {
                    results.push({
                        rank: tds[0].textContent.trim(),           // 순위
                        team: tds[1].textContent.trim(),           // 팀명
                        games: tds[2].textContent.trim(),          // 경기수
                        wins: tds[3].textContent.trim(),           // 승
                        losses: tds[4].textContent.trim(),         // 패
                        draws: tds[5].textContent.trim(),          // 무
                        winRate: tds[6].textContent.trim(),        // 승률
                        gameBehind: tds[7].textContent.trim(),     // 게임차
                        last10: tds[8].textContent.trim(),         // 최근10경기
                        streak: tds[9].textContent.trim(),         // 연속
                        homeAway: tds[10] ? tds[10].textContent.trim() : '' // 홈/원정 (있는 경우)
                    });
                }
            });
            
            // 성공적으로 데이터를 가져온 경우
            if (results.length > 0) {
                updateRankingDisplay(results);
                return;
            }
            
            // CORS 문제로 직접 크롤링이 안 되는 경우 백업 데이터 사용
            throw new Error('크롤링 접근 제한');
            
        } catch (error) {
            console.error('크롤링 에러:', error);
            
            // 백업 데이터 사용
            const backupRankings = [
                { rank: '1', team: 'KIA', games: '144', wins: '87', losses: '55', draws: '2', winRate: '0.613', last10: '8승0무2패', streak: '2승' },
                { rank: '2', team: '삼성', games: '144', wins: '81', losses: '61', draws: '2', winRate: '0.570', last10: '6승0무4패', streak: '1승' },
                { rank: '3', team: 'LG', games: '144', wins: '79', losses: '64', draws: '1', winRate: '0.552', last10: '5승0무5패', streak: '2승' },
                { rank: '4', team: '두산', games: '144', wins: '76', losses: '66', draws: '2', winRate: '0.535', last10: '6승0무4패', streak: '1패' },
                { rank: '5', team: 'KT', games: '144', wins: '72', losses: '70', draws: '2', winRate: '0.507', last10: '4승0무6패', streak: '3패' },
                { rank: '6', team: 'SSG', games: '144', wins: '72', losses: '71', draws: '1', winRate: '0.503', last10: '5승0무5패', streak: '1승' },
                { rank: '7', team: '롯데', games: '144', wins: '66', losses: '76', draws: '2', winRate: '0.465', last10: '3승0무7패', streak: '2패' },
                { rank: '8', team: 'NC', games: '144', wins: '62', losses: '81', draws: '1', winRate: '0.434', last10: '4승0무6패', streak: '1승' },
                { rank: '9', team: '키움', games: '144', wins: '61', losses: '82', draws: '1', winRate: '0.427', last10: '3승0무7패', streak: '1패' },
                { rank: '10', team: '한화', games: '144', wins: '57', losses: '86', draws: '1', winRate: '0.399', last10: '2승0무8패', streak: '4패' }
            ];
            
            updateRankingDisplay(backupRankings);
        }
    }
    
    // 순위 화면 업데이트 함수
    function updateRankingDisplay(rankings) {
        const rankingContainer = document.querySelector('aside .space-y-2');
        
        if (!rankingContainer) {
            console.error('순위 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 기존 내용 제거
        rankingContainer.innerHTML = '';
        
        // 상위 5개 팀만 표시
        rankings.slice(0, 5).forEach(team => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'p-2 bg-gray-50 rounded border text-sm';
            
            // 팀명 매핑 (축약형 -> 전체명)
            const teamNames = {
                'KIA': 'KIA 타이거즈',
                '삼성': '삼성 라이온즈', 
                'LG': 'LG 트윈스',
                '두산': '두산 베어스',
                'KT': 'KT 위즈',
                'SSG': 'SSG 랜더스',
                '롯데': '롯데 자이언츠',
                'NC': 'NC 다이노스',
                '키움': '키움 히어로즈',
                '한화': '한화 이글스'
            };
            
            const fullTeamName = teamNames[team.team] || team.team;
            
            rankingItem.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium">${team.rank}</span>
                    <span class="font-medium text-xs">${fullTeamName}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    승률 ${team.winRate} (${team.wins}승 ${team.losses}패 ${team.draws}무)
                </div>
                <div class="text-xs text-gray-400 mt-1">
                    최근: ${team.last10} | ${team.streak}
                </div>
            `;
            
            rankingContainer.appendChild(rankingItem);
        });
        
        console.log('구단 순위 업데이트 완료:', rankings.length + '개 팀');
    }
    
    // 초기 로드
    await loadTeamRankings();
    
    // 1시간마다 업데이트
    setInterval(loadTeamRankings, 60 * 60 * 1000);
});
console.log('KBO 구단 순위 크롤링 스크립트 로드 완료');