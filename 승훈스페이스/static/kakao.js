const domain = window.location.origin;
Kakao.init(
    "e42438b65f86e1d217584eb6ac111cef"); // [JavaScript SDK로 로그인]을 테스트하려면 [앱 키]에서 확인한 JavaScript 키를 입력하세요.
function kakaoLogin() {
    Kakao.Auth.authorize({
        redirectUri: `${domain}/kakao/redirect`,
    });
}