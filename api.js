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

// 2. 구단 순위 데이터 로드 (실제 크롤링 대신 백업 데이터 사용)
document.addEventListener('DOMContentLoaded', function() {
    function loadTeamRankings() {
        // HTML에서 구단 순위가 표시되는 컨테이너를 찾음
        const rankingContainer = document.querySelector('aside .space-y-2');
        
        if (!rankingContainer) {
            console.error('구단 순위 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 실제 KBO 순위 데이터 (백업용)
        const teamRankings = [
            { rank: 1, team: 'KIA 타이거즈', games: 144, wins: 87, losses: 55, draws: 2, winRate: '.613' },
            { rank: 2, team: '삼성 라이온즈', games: 144, wins: 81, losses: 61, draws: 2, winRate: '.570' },
            { rank: 3, team: 'LG 트윈스', games: 144, wins: 79, losses: 64, draws: 1, winRate: '.552' },
            { rank: 4, team: '두산 베어스', games: 144, wins: 76, losses: 66, draws: 2, winRate: '.535' },
            { rank: 5, team: 'KT 위즈', games: 144, wins: 72, losses: 70, draws: 2, winRate: '.507' },
            { rank: 6, team: 'SSG 랜더스', games: 144, wins: 72, losses: 71, draws: 1, winRate: '.503' },
            { rank: 7, team: '롯데 자이언츠', games: 144, wins: 66, losses: 76, draws: 2, winRate: '.465' },
            { rank: 8, team: 'NC 다이노스', games: 144, wins: 62, losses: 81, draws: 1, winRate: '.434' },
            { rank: 9, team: '키움 히어로즈', games: 144, wins: 61, losses: 82, draws: 1, winRate: '.427' },
            { rank: 10, team: '한화 이글스', games: 144, wins: 57, losses: 86, draws: 1, winRate: '.399' }
        ];
        
        // 순위 업데이트
        rankingContainer.innerHTML = '';
        teamRankings.slice(0, 5).forEach(team => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'p-2 bg-gray-50 rounded border text-sm';
            rankingItem.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium">${team.rank}</span>
                    <span class="font-medium text-xs">${team.team}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">승률 ${team.winRate} (${team.wins}승 ${team.losses}패)</div>
            `;
            rankingContainer.appendChild(rankingItem);
        });
    }
    
    // 구단 순위 로드 실행
    loadTeamRankings();
    
    // 1시간마다 업데이트
    setInterval(loadTeamRankings, 60 * 60 * 1000);
});

// 3. 선수 순위 업데이트
document.addEventListener('DOMContentLoaded', function() {
    function loadPlayerRankings() {
        // 선수 순위 섹션 찾기
        const playerSection = document.querySelector('aside .space-y-6').children[2];
        const playerContainer = playerSection?.querySelector('.space-y-2');
        
        if (!playerContainer) {
            console.error('선수 순위 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 타율 순위 데이터
        const playerRankings = [
            { name: '최형우', team: 'KIA', avg: '.347' },
            { name: '김도영', team: 'KIA', avg: '.341' },
            { name: '박병호', team: 'KT', avg: '.335' },
            { name: '구자욱', team: '삼성', avg: '.329' },
            { name: '김혜성', team: '키움', avg: '.326' }
        ];
        
        // 선수 순위 업데이트
        playerContainer.innerHTML = '';
        playerRankings.slice(0, 3).forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'p-2 bg-gray-50 rounded border text-sm';
            playerItem.innerHTML = `
                <div class="font-medium">${player.name}</div>
                <div class="text-xs text-gray-500">${player.team} • ${player.avg}</div>
            `;
            playerContainer.appendChild(playerItem);
        });
    }
    
    // 선수 순위 로드 실행
    loadPlayerRankings();
    
    // 1시간마다 업데이트
    setInterval(loadPlayerRankings, 60 * 60 * 1000);
});

// 4. 배너 슬라이드 기능 (HTML에 배너가 하나만 있지만 확장 가능하도록)
let currentBanner = 0;
const banners = [
    {
        title: "암표 없는 공정한 예매",
        subtitle: "구역별 3분 간격 시스템으로 모든 팬에게 공평한 기회를",
        description: "Time-Pitch는 티켓 암표와 몰림 현상을 방지하여 진정한 야구 팬들이 공정하게 티켓을 구매할 수 있도록 합니다.",
        gradient: "from-blue-600 to-indigo-700"
    }
];

function nextBanner() {
    currentBanner = (currentBanner + 1) % banners.length;
    updateBanner();
}

function prevBanner() {
    currentBanner = (currentBanner - 1 + banners.length) % banners.length;
    updateBanner();
}

function updateBanner() {
    const bannerContainer = document.getElementById('bannerContainer');
    if (!bannerContainer) return;
    
    const banner = banners[currentBanner];
    const bannerSlide = bannerContainer.querySelector('.banner-slide');
    
    if (bannerSlide) {
        bannerSlide.className = `banner-slide absolute inset-0 bg-gradient-to-r ${banner.gradient} text-white`;
        bannerSlide.querySelector('h2').textContent = banner.title;
        bannerSlide.querySelector('p').textContent = banner.subtitle;
        bannerSlide.querySelectorAll('p')[1].textContent = banner.description;
    }
}

// 5. 예매 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const bookingButtons = document.querySelectorAll('[class*="bg-blue-600"]:not([disabled])');
    
    bookingButtons.forEach(button => {
        if (button.textContent.includes('예매하기')) {
            button.addEventListener('click', function() {
                alert('예매 페이지로 이동합니다.');
                // 실제로는 예매 페이지로 리디렉션
                // window.location.href = '/booking';
            });
        }
    });
});

console.log('API 및 크롤링 JavaScript 로드 완료');