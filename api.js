
// CORS 이슈로 인해 브라우저에서 직접 실행하기 어려울 수 있습니다.
// Node.js 환경에서 실행하려면 cheerio, axios 등의 패키지를 설치해야 합니다.

// 브라우저 환경용 (CORS 프록시 필요할 수 있음)
async function scrapeBaseball() {
    try {
        const url = "https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx";
        
        // fetch를 사용하여 데이터 가져오기
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // DOM 파서 생성
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 요소 선택
        const baseball = doc.getElementById('cphContents_cphContents_cphContents_udpRecord');
        
        if (!baseball) {
            console.log('해당 ID를 가진 요소를 찾을 수 없습니다.');
            return;
        }
        
        const team = baseball.querySelector('tbody');
        
        if (!team) {
            console.log('tbody 요소를 찾을 수 없습니다.');
            return;
        }
        
        const trElements = team.querySelectorAll('tr');
        
        // 각 행 처리
        trElements.forEach((tr, index) => {
            const tdElements = tr.querySelectorAll('td');
            if (tdElements.length > 1) {
                console.log(tdElements[1].textContent.trim());
            }
        });
        
    } catch (error) {
        console.error('스크래핑 중 오류 발생:', error);
    }
}

// 함수 실행
scrapeBaseball();