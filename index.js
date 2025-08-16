// html 자바스크립트 통합 코드
// 배너 기능과 예매 버튼 이벤트 처리?

// 간단한 배너 기능 (현재는 1개 배너만 표시)
        let currentBanner = 0;
        const banners = [
            {
                title: "암표 없는 공정한 예매",
                subtitle: "구역별 3분 간격 시스템으로 모든 팬에게 공평한 기회를",
                description: "Time-Pitch는 티켓 암표와 몰림 현상을 방지하여 진정한 야구 팬들이 공정하게 티켓을 구매할 수 있도록 합니다.",
                bgColor: "from-blue-600 to-indigo-700"
            }
        ];

        function nextBanner() {
            // 현재는 1개 배너만 있으므로 기능 없음
            console.log('다음 배너');
        }

        function prevBanner() {
            // 현재는 1개 배너만 있으므로 기능 없음
            console.log('이전 배너');
        }

        // 예매 버튼 클릭 이벤트
        document.addEventListener('DOMContentLoaded', function() {
            const bookingButtons = document.querySelectorAll('button:not([disabled])');
            bookingButtons.forEach(button => {
                if (button.textContent.includes('예매하기')) {
                    button.addEventListener('click', function() {
                        alert('예매 페이지로 이동합니다!');
                    });
                }
            });
        });

      document.addEventListener('DOMContentLoaded', function() {
        // 모든 '예매하기' 버튼을 booking.html로 연결
        document.querySelectorAll('button, a').forEach(el => {
          const t = (el.textContent || '').trim();
          if (t.includes('예매하기')) {
          }
        });
      });