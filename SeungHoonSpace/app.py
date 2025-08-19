# api.py
import os
import requests
from flask import Flask, render_template, redirect, request, session, Blueprint, make_response, send_from_directory
import json

os.chdir(os.path.dirname(__file__))
with open("appdata.json", 'r', encoding='utf-8') as f:
    appdata = json.load(f);

from pymongo.mongo_client import MongoClient
from routes import kakao, jungle, booking

mongo = MongoClient(appdata["mongo"]["uri"], appdata["mongo"]["port"])



#Flask 애플리케이션 생성
app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['jungle'] = appdata['jungle']
app.config['kakao'] = appdata['kakao']
app.config['mongo'] = mongo.jungle
app.register_blueprint(kakao.blueprint)
app.register_blueprint(jungle.blueprint)
app.register_blueprint(booking.blueprint)
# Create a new client and connect to the server

@app.route('/')
def home():
    return render_template('index.html');

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/signin')
def signin():
    return render_template('signin.html')

@app.route('/mypage')
def mypage():
    return render_template('mypage.html')
    
@app.route('/ticket_detail')
def ticket_detail():
    param['data'] = {
    "event_id": 1,
    "stadium": "광주의 아들 김도영",
    "price": 800,
    "area_name": "내야 1루",
    "date": {
        "year": 2025,
        "month": 8,
        "day": 25,
        "hour": 18,
        "min": 30
    },
    "seats": [1, 2, 3],
    "team1": "403호",
    "team2": "401호"
    }
    return render_template('ticket_detail.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True, port=35565)
    print("server started")

