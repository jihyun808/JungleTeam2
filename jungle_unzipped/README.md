# Time‑Pitch Lite (이미지/대용량 CSS 제외)

- `index.html` : Time‑Pitch 레이아웃 (이미지는 placeholder URL 사용)
- `booking.html` : 예매 페이지 (Tailwind CDN + `css/styles.css` 소형)
- `js/booking.js` : 데모 일정 데이터/필터
- `app.py` : Flask 서버

## 실행
```bash
python -m venv venv
venv\Scripts\Activate.ps1   # Windows
# source venv/bin/activate    # macOS/Linux
pip install flask
python app.py  # http://localhost:5000
```
