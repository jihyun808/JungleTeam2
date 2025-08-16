
// 1. 뉴스 데이터 가져오기 api 
document.addEventListener('DOMContentLoaded', function () {
    
    // 뉴스 데이터 가져오기 함수
    function loadNews() {
        const newsContainer = document.getElementById('news-container');
        
        // 로딩 표시
        newsContainer.innerHTML = '<div class="col-12"><div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div></div>';
        
        // rss코드 json으로 변환
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
                
                // RSS 피드에서 아이템 가져오기 (최대 6개)
                const items = data.items || [];
                items.slice(0, 3).forEach(item => {
                    const newsCard = document.createElement('div');
                    newsCard.className = 'col-md-4 mb-3';
                    newsCard.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-title">${item.title}</h6>
                                <p class="card-text text-muted small">${item.description ? item.description.substring(0, 100) + '...' : ''}</p>
                                <small class="text-muted">${new Date(item.pubDate).toLocaleDateString('ko-KR')}</small>
                            </div>
                            <div class="card-footer">
                                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">기사 보기</a>
                            </div>
                        </div>
                    `;
                    newsContainer.appendChild(newsCard);
                });
                
                // 데이터가 없는 경우
                if (items.length === 0) {
                    newsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">뉴스를 불러올 수 없습니다.</div></div>';
                }
            })
            .catch(error => {
                console.error('뉴스 로딩 에러:', error);
                newsContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">뉴스를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</div></div>';
            });
    }
    
    loadNews();
    
    // 10분마다 새로고침
    setInterval(loadNews, 10 * 60 * 1000);
});

// 백업용 뉴스 데이터 (RSS가 실패할 경우 사용)
function loadBackupNews() {
    const newsContainer = document.getElementById('news-container');
    const backupNews = [
        {
            title: "'100승 감독' 김태형, 롯데와 3년 24억원 계약",
            content: "프로야구 롯데 자이언츠가 제21대 감독으로 김태형(56) 전 두산 베어스 감독을 선임했다.",
            link: "https://via.placeholder.com/300x200.png?text=News+1"
        },
        {
            title: "KIA, 소크라테스와 총액 120만 달러에 재계약",
            content: "KIA 타이거즈가 외국인 타자 소크라테스 브리토(31)와 재계약을 마쳤다.",
            link: "https://via.placeholder.com/300x200.png?text=News+2"
        },
        {
            title: "이정후, MLB 샌프란시스코와 6년 1억1300만달러 계약",
            content: "이정후(25)가 미국프로야구 메이저리그(MLB) 샌프란시스코 자이언츠 유니폼을 입는다.",
            link: "https://via.placeholder.com/300x200.png?text=News+3"
        }
    ];

    newsContainer.innerHTML = '';
    backupNews.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'col-md-4 mb-3';
        newsCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h6 class="card-title">${news.title}</h6>
                    <p class="card-text text-muted small">${news.content}</p>
                    <small class="text-muted">${news.date}</small>
                </div>
            </div>
        `;
        newsContainer.appendChild(newsCard);
    });
}



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