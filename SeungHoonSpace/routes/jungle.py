from flask import render_template, redirect, request, session, Blueprint, current_app, url_for
import requests
import hashlib

blueprint = Blueprint('jungle', __name__, url_prefix='/jungle');

def hashing(data):
    hash_object = hashlib.sha256()
    hash_object.update((str(data['id']) + str(data['password'] + current_app.config['jungle']['sha-secret-key'])).encode())
    return hash_object.hexdigest()

@blueprint.route('/signup', methods=['GET','POST'])    
def signup():
    data = {
        'id': request.form.get('id'),
        'password': request.form.get('password'),
        'hashed_password': ""
        }
    data['hashed_password'] = hashing(data)
    
    param = {
        'access': True,
        'code': '',
        'message': ''
    }
    
    id_overlap = current_app.config['mongo'].users.find_one({'platform':'jungle','id':data['id']})
    
    if (len(data['id']) < 6): #id 글자수 부족
        param['access'] = False
        param['code'] = 'lack_of_id_length'
        param['message'] = 'ID는 6글자 이상이여야 합니다.'
        return render_template('signup.html', param=param)
        
    if (len(data['password']) < 8): #비밀번호 글자수 부족
        param['access'] = False
        param['code'] = 'lack_of_pw_length'
        param['message'] = '비밀번호는 8글자 이상이여야 합니다.'
        return render_template('signup.html', param=param)
    
    for c in data['password']:
        if not (c in current_app.config['jungle']['key_dict']):
            param['access'] = False
            param['code'] = 'wrong_pw_str'
            param['message'] = '비밀번호와 id는 영어 소문자/대문자, 0~9, ~!@#$%^&*()_+으로 구성되어야 합니다.'
            return render_template('signup.html', param=param)
    
    for c in data['id']:
        if not (c in current_app.config['jungle']['key_dict']):
            param['access'] = False
            param['code'] = 'wrong_pw_str'
            param['message'] = '비밀번호와 id는 영어 소문자/대문자, 0~9, ~!@#$%^&*()_+으로 구성되어야 합니다.'
            return render_template('signup.html', param=param)
    
    
    if (id_overlap): # id 중복
        if (current_app.config['mongo'].users.find_one({'platform':'jungle','id':data['id'],'password':data['hashed_password']})): # 이미 계정이 있음.
            session['platform'] = 'jungle'
            session['id'] = data['id']
            if (current_app.config['mongo'].users.find_one({'platform':'jungle','id':data['id'],'password':data['hashed_password']}).get('username')): #이름이 있음
                return redirect('/')
            return render_template('signup_username.html', platform='jungle') #이름이 없으면 닉네임 입력 창으로 이동
        param['access'] = False
        param['code'] = 'id_overlap'
        param['message'] = '중복 ID 입니다'
        return render_template('signup.html', param=param) #중복임
    
    current_app.config['mongo'].users.insert_one({'platform':'jungle','id':data['id'],'password':data['hashed_password']}) #저장
    session['id'] = data['id']
    session['platform'] = 'jungle'
    return render_template('signup_username.html', platform='jungle')

@blueprint.route('/signin', methods=['GET','POST'])
def signin():
    data = {
        'id': request.form.get('id'),
        'password': request.form.get('password'),
        'hashed_password': ""
        }
    data['hashed_password'] = hashing(data)
    
    if (current_app.config['mongo'].users.find_one({'platform':'jungle','id':data['id'],'password':data['hashed_password']})):
        session['id'] = data['id']
        session['platform'] = 'jungle'
        return redirect('/?login=success')
    
    return render_template('signin.html', platform='jungle', message='ID 또는 비밀번호가 일치하지 않습니다.')


@blueprint.route('/edit_name', methods=['GET','POST'])
def edit_name():
    id = session.get('id')
    if not id:
        return redirect("/signup")

    if request.method == 'POST':
        username = request.form.get('username')
        print(username);
        if (current_app.config['mongo'].users.find_one({'username':username})):
            return render_template('signup_username.html', error="닉네임 중복.", platform="jungle")

        if username:
            current_app.config['mongo'].users.update_one(
                {'platform': 'jungle', 'id': id},
                {'$set': {'username': username}}
            )
            return redirect('/')
        else:
            return render_template('signup_username.html', error="닉네임을 입력해주세요.", platform="jungle")

    return render_template('signup_username.html', error="잘못된 전송 방식입니다.", platform='jungle')
    