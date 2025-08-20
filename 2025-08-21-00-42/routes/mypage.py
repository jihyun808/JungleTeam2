from flask import render_template, redirect, request, session, Blueprint, current_app, url_for
import requests
import json
blueprint = Blueprint('mypage', __name__, url_prefix='/mypage');



@blueprint.route('/', methods=['GET','POST'])    
def mypage():
    param = {
        "message": session.get('message'),
        "session": {
            "isLogged":False
        }
    }
    if (session.get('id')):
        param['session']['isLogged'] = True
    platform = session.get('platform')
    id = session.get('id')
    
    if (not platform or not id):
        session['message'] = '로그인 이후 이용해주세요.'
        return redirect('/signin')
    
    user = current_app.config['mongo'].users.find_one({"platform":platform,"id":str(id)},{"_id":0})
    tickets = user.get('tickets')
    
    param["tickets"] = json.dumps(tickets)
    param["username"] = user.get('username')
    param['session'] = json.dumps(param['session'],ensure_ascii=False)
    
    return render_template('mypage.html', param=param)

@blueprint.route('/ticket_detail', methods=['GET','POST'])
def ticket_detail():
    param = {
        "message": session.get('message'),
        "session": {
            "isLogged":False
        }
    }
    if (session.get('id')):
        param['session']['isLogged'] = True
    platform = session.get('platform')
    id = session.get('id')
    ticket_id = request.values.get('ticket_id')
    
    
    if (not platform or not id):
        session['message'] = '로그인 이후 이용해주세요.'
        return redirect('/signixn')
    
    user = current_app.config['mongo'].users.find_one({"platform":platform,"id":str(id)},{"_id":0})
    tickets = user.get('tickets')
    ticket = next((t for t in tickets if t['ticket_id'] == ticket_id), None)
    print(ticket)
    param['data'] = json.dumps(ticket)
    param['username'] = user.get('username')
    param['session'] = json.dumps(param['session'],ensure_ascii=False)
    return render_template('ticket_detail.html', param=param)