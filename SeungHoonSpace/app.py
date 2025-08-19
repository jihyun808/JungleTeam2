import os
import requests
from flask import Flask, render_template, redirect, request, session, Blueprint, make_response, send_from_directory
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import json

os.chdir(os.path.dirname(__file__))

with open("appdata.json", 'r', encoding='utf-8') as f:
    appdata = json.load(f)

from pymongo.mongo_client import MongoClient
from routes import kakao, jungle, booking

mongo = MongoClient(appdata["mongo"]["uri"], appdata["mongo"]["port"])

#Flask 애플리케이션 생성
app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['jungle'] = appdata['jungle']
app.config['kakao'] = appdata['kakao']
app.config['mongo'] = mongo.jungle

# Flask-Limiter 설정
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per hour"]  # 전체 API는 시간당 100회 제한
)

app.register_blueprint(kakao.blueprint)
app.register_blueprint(jungle.blueprint)
app.register_blueprint(booking.blueprint)

# Create a new client and connect to the server

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/signin')
@limiter.limit("5 per minute")  # 로그인은 1분에 5번만 허용
def signin():
    return render_template('signin.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=35565)
    print("server started")
