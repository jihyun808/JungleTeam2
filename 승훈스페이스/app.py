# api.py
import os
import requests
from flask import Flask, render_template, redirect, request, session, Blueprint, make_response, send_from_directory, current_app
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
    param = {
        "message": session.get('message')
    }
    session.pop('message',None)
    return render_template('signin.html', param=param)

@app.route('/mypage')
def mypage():
    param = {
        "message": session.get('message')
    }
    platform = session.get('platform')
    id = session.get('id')
        
    if (not platform or not id):
        session['message'] = '로그인 이후 이용해주세요.'
        return redirect('/signin')
    user = current_app.config['mongo'].users.find_one({"platform":platform,"id":id},{"_id":0})
    tickets = user.get('tickets')
    
    param["tickets"] = json.dumps(tickets)
    param["username"] = user.get('username')
    
    return render_template('mypage.html', param=param)



if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True, port=35565)
    print("server started")

