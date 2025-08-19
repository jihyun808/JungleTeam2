from flask import render_template, redirect, request, session, Blueprint, current_app, url_for
import requests

blueprint = Blueprint('kakao', __name__, url_prefix='/kakao')

@blueprint.route("/authorize", methods=['GET','POST'])
def authorize():
    scope_param = ""
    if request.args.get("scope"):
        scope_param = "&scope=" + request.args.get("scope")

    return redirect(
        "{0}/oauth/authorize?response_type=code&client_id={1}&redirect_uri={2}{3}".format(
            current_app.config["kakao"]["kauth_host"], current_app.config["kakao"]["rest_key"], current_app.config["kakao"]["domain"] + "/redirect", scope_param))

@blueprint.route("/redirect")
def redirect_page():
    data = {
        'grant_type': 'authorization_code',
        'client_id': current_app.config["kakao"]["rest_key"],
        'redirect_uri': current_app.config["kakao"]["domain"] + "/redirect",
        'client_secret': current_app.config["kakao"]["secret_key"],
        'code': request.args.get("code")
    }

    resp = requests.post(current_app.config["kakao"]["kauth_host"] + "/oauth/token", data=data)
    access_token = resp.json()['access_token']
    session['access_token'] = access_token

    user_info_resp = requests.get(
        current_app.config["kakao"]["kapi_host"] + "/v2/user/me",
        headers={'Authorization': f'Bearer {access_token}'}
    )
    user_info = user_info_resp.json()
    print(user_info)
    kakao_id = user_info['id']
    session['kakao_id'] = kakao_id
    session['platform'] = 'kakao'

    user = current_app.config['mongo'].users.find_one({'platform': 'kakao', 'id': str(kakao_id)})

    if user and user.get("username"):
        return redirect("/?login=success")
    else:
        if not user:
            current_app.config['mongo'].users.insert_one({'platform': 'kakao', 'id': str(kakao_id)})
        return render_template('signup_username.html', platform="kakao")

@blueprint.route("/edit_name", methods=['GET','POST'])
def edit_name():
    kakao_id = session.get('kakao_id')
    if not kakao_id:
        return redirect("/kakao/authorize")

    if request.method == 'POST':
        username = request.form.get('username')

        if (current_app.config['mongo'].users.find_one({'username':username})):
            return render_template('signup_username.html', error="닉네임 중복", platform="kakao")

        if username:
            current_app.config['mongo'].users.update_one(
                {'platform': 'kakao', 'id': str(kakao_id)},
                {'$set': {'username': username}}
            )
            
            return redirect('/')
        else:
            return render_template('signup_username.html', error="닉네임을 입력해주세요.", platform="kakao")

    return render_template('signup_username.html', error="잘못된 전송 방식입니다", platform="kakao")

@blueprint.route("/profile")
def profile():
    headers = {
        'Authorization': 'Bearer ' + session.get('access_token', '')
    }

    resp = requests.get(current_app.config["kakao"]["kapi_host"] + "/v2/user/me", headers=headers)

    return resp.text

@blueprint.route("/logout")
def logout():
    headers = {
        'Authorization': 'Bearer ' + session.get('access_token', '')
    }
    resp = requests.post(current_app.config["kakao"]["kapi_host"] + "/v1/user/logout", headers=headers)
    session.pop('access_token', None)
    session.pop('platform', None)
    return resp.text

@blueprint.route("/unlink")
def unlink():
    headers = {
        'Authorization': 'Bearer ' + session.get('access_token', '')
    }
    resp = requests.post(current_app.config["kakao"]["kapi_host"] + "/v1/user/unlink", headers=headers)
    session.pop('access_token', None)
    session.pop('platform', None)
    return resp.text