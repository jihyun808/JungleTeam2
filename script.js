document.addEventListener('DOMContentLoaded', function () {
    const newsContainer = document.getElementById('news-container');

    const sampleNews = [
        {
            title: "'100승 감독' 김태형, 롯데와 3년 24억원 계약",
            content: "프로야구 롯데 자이언츠가 제21대 감독으로 김태형(56) 전 두산 베어스 감독을 선임했다.",
            imageUrl: "https://via.placeholder.com/300x200.png?text=News+1"
        },
        {
            title: "KIA, 소크라테스와 총액 120만 달러에 재계약",
            content: "KIA 타이거즈가 외국인 타자 소크라테스 브리토(31)와 재계약을 마쳤다.",
            imageUrl: "https://via.placeholder.com/300x200.png?text=News+2"
        },
        {
            title: "이정후, MLB 샌프란시스코와 6년 1억1300만달러 계약",
            content: "이정후(25)가 미국프로야구 메이저리그(MLB) 샌프란시스코 자이언츠 유니폼을 입는다.",
            imageUrl: "https://via.placeholder.com/300x200.png?text=News+3"
        },
        {
            title: "LG 트윈스, 29년 만에 통합 우승... MVP는 오지환",
            content: "LG 트윈스가 29년 만에 한국시리즈 정상에 올랐다. MVP는 주장 오지환에게 돌아갔다.",
            imageUrl: "https://via.placeholder.com/300x200.png?text=News+4"
        },
        {
            title: "한화, '레전드' 류현진과 8년 170억원 계약",
            content: "한화 이글스가 미국 메이저리그에서 돌아온 류현진(36)과 KBO리그 역대 최고 대우로 계약했다.",
            imageUrl: "https://via.placeholder.com/300x200.png?text=News+5"
        },
        {
            title: "KT, '대체 외인' 쿠에바스와 총액 150만 달러 재계약",
            content: "KT 위즈가 윌리엄 쿠에바스(33)와 재계약하며 2024시즌 외국인 선수 구성을 마쳤다.",
            imageUrl: "https://via.placeholder.com/300x200.png?text=News+6"
        }
    ];

    function loadNews() {
        newsContainer.innerHTML = '';
        const shuffledNews = sampleNews.sort(() => 0.5 - Math.random());
        const selectedNews = shuffledNews.slice(0, 3); // 3개의 뉴스만 선택

        selectedNews.forEach(news => {
            const newsCard = `
                <div class="col-md-4 mb-3">
                    <div class="card news-card">
                        <img src="${news.imageUrl}" class="card-img-top" alt="${news.title}">
                        <div class="card-body">
                            <h5 class="card-title">${news.title}</h5>
                            <p class="card-text">${news.content}</p>
                            <a href="#" class="btn btn-sm btn-outline-secondary">기사 보기</a>
                        </div>
                    </div>
                </div>
            `;
            newsContainer.innerHTML += newsCard;
        });
    }

    loadNews();
});
