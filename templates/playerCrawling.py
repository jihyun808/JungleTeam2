from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time


# 1. 드라이버 실행 함수
def start_driver(url):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    driver.get(url)
    return driver

# 2. 선수 테이블 데이터 추출
def parse_table(driver):
    data_list = []
    
    # 페이지 로딩 대기
    wait = WebDriverWait(driver, 10)
    
    try:
        # 여러 가능한 선택자들을 시도
        possible_selectors = [
            "cphContents_cphContents_cphContents_pnlVsTeam table.tData01.tt tbody tr",  # 일반적인 테이블 구조
        ]
        
        table_rows = None
        used_selector = None
        
        for selector in possible_selectors:
            try:
                print(f"시도 중인 선택자: {selector}")
                table_rows = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, selector)))
                if table_rows:
                    used_selector = selector
                    print(f"성공한 선택자: {selector}")
                    break
            except:
                continue
        
        if not table_rows:
            # 모든 테이블을 찾아서 출력 (디버깅용)
            print("사용 가능한 테이블 구조를 찾는 중...")
            tables = driver.find_elements(By.TAG_NAME, "table")
            print(f"찾은 테이블 개수: {len(tables)}")
            
            for i, table in enumerate(tables):
                try:
                    rows = table.find_elements(By.TAG_NAME, "tr")
                    if len(rows) > 1:  # 헤더 포함해서 2개 이상의 행이 있는 테이블
                        print(f"테이블 {i+1}: {len(rows)}개 행")
                        # 첫 번째 유효한 테이블 사용
                        table_rows = rows
                        break
                except:
                    continue
        
        if not table_rows:
            raise Exception("순위 테이블을 찾을 수 없습니다.")
        
        # 데이터 추출
        for i, row in enumerate(table_rows):
            try:
                cols = row.find_elements(By.TAG_NAME, "td")
                if len(cols) >= 4:  # 순위, 선수명, 팀명, 타율
                    data = {
                        "rank": cols[0].text.strip(),
                        "name": cols[1].text.strip(),
                        "team": cols[2].text.strip(),
                        "avg": cols[3].text.strip()
                    }
                    
                    # 빈 데이터가 아닌 경우만 추가
                    if data["team"] and data["rank"]:
                        data_list.append(data)
                        
            except Exception as e:
                print(f"행 {i} 처리 중 오류: {e}")
                continue
    
    except Exception as e:
        print(f"테이블 파싱 오류: {e}")
        
        # 페이지 소스 일부 출력 (디버깅용)
        print("페이지 제목:", driver.title)
        print("현재 URL:", driver.current_url)
        
        # HTML에서 'tData' 또는 'rank' 관련 요소 찾기
        try:
            page_source = driver.page_source
            if 'tData' in page_source:
                print("페이지에 'tData' 클래스가 있습니다.")
            if 'rank' in page_source.lower():
                print("페이지에 'rank' 관련 내용이 있습니다.")
        except:
            pass
    
    return data_list

# 3. JSON 변환
def convert_to_json(data_list):
    return json.dumps(data_list, ensure_ascii=False, indent=2)

# 4. 실행 예시
if __name__ == "__main__":
    url = "https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx?sort=HRA_RT"
    driver = start_driver(url)
    
    try:
        # 페이지 로딩 완료 대기
        time.sleep(5)
        
        # 파싱 시도
        data_list = parse_table(driver)
        
        # 파싱 실패시 오류 메세지 출력
        if not data_list:
            print("메인 파싱 실패")
        
        if data_list:

            # 상위 3개 데이터만 추출
            top3 = data_list[:3]

            json_data = convert_to_json(top3)
            print("=== KBO 구단 순위 데이터 ===")
            print(json_data)
        else:
            print("데이터를 추출할 수 없습니다.")
            print(f"페이지 제목: {driver.title}")
            print(f"현재 URL: {driver.current_url}")
            
    finally:
        driver.quit()