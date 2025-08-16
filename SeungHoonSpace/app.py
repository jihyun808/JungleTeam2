# api.py
import os
import requests
from flask import Flask, render_template, redirect, request, session, Blueprint, make_response
import json

os.chdir(os.path.dirname(__file__))
with open("appdata.json", 'r', encoding='utf-8') as f:
    appdata = json.load(f);

from pymongo.mongo_client import MongoClient
from routes import kakao
from routes import jungle

mongo = MongoClient(appdata["mongo"]["uri"], appdata["mongo"]["port"])
    
#Flask 애플리케이션 생성
app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['jungle'] = appdata['jungle']
app.config['kakao'] = appdata['kakao']
app.config['mongo'] = mongo.jungle
app.register_blueprint(kakao.blueprint)
app.register_blueprint(jungle.blueprint)
# Create a new client and connect to the server

@app.route('/')
def home():
   return render_template('index.html');

@app.route('/booking')
def booking():
   return render_template('booking.html');

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/signin')
def signin():
    return render_template('signin.html')




if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True, port=35565)
    print("server started")
    
    
    

