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
                        'https://c.files.bbci.co.uk/A556/production/_112162324_origin_.jpg',
                        'https://file2.nocutnews.co.kr/newsroom/image/2025/06/26/202506261725488605_0.jpg',
                        'https://static.wbsc.org/assets/cms/57dd1d92-2e74-a7c5-7a0f-2bda3669b5c9.JPG'
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