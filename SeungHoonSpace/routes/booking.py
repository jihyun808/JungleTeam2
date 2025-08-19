from flask import render_template, redirect, request, session, Blueprint, current_app, url_for
import requests
from datetime import datetime, timedelta
import json
blueprint = Blueprint('book', __name__, url_prefix='/booking')

def CompareTime(t): #입력값 현재 시간을 지났다면 False 안 지났다면 True
    try:
        input_datetime = datetime(
            t.get("year"),
            t.get("month"),
            t.get("day"),
            t.get("hour"),
            t.get("min")
        )
    except (TypeError, ValueError):
        return False
        
    return input_datetime < datetime.now()


@blueprint.route('/')
def booking():
    param = {
        "message":"",
        "data":{
        }
    }
    message = session.get('message')
    if (message):
        param['message'] = message
        session.pop('message', None)
    session.pop('event_id', None)
    session.pop('area_num', None)
    
    events = []
    for e in current_app.config['mongo'].events.find({}):
        event = e['info']
        event['event_id'] = e['event_id']
        events.append(e['info'])
    param['data']['events'] = json.dumps(events, ensure_ascii=False)
    
    return render_template('booking.html', param=param)

@blueprint.route('/select_seat', methods=['POST','GET'])
def select_seat():
    param = {
        "message":"",
        "data":{
        }
    }
    event_id = request.values.get('event_id')
    area_num = request.values.get('area_num')
    seats = json.loads(request.values.get('selection'))
    #조회 성공 유무
    event = current_app.config['mongo'].events.find_one({"event_id":int(event_id)})
    if (not area_num or not event_id):
        session['message'] = "세션이 만료되었습니다."
        return redirect('/booking')
    
    #예매시간
    start_time = event.get('booking')
    if (start_time):
        start_time = start_time.get('areas')
        if (start_time):
            start_time = start_time.get('1')
    if (start_time == None):
        session['message'] = "예매 가능한 시간이 아닙니다."
        return redirect('/booking')
    
    #구역조회
    area = event.get('booking')
    if (area):
        area = area.get('areas')
        if (area):
            area = area.get(f'{area_num}')
    if (area == None):
        session['message'] = "잘못된 area_num"
        return redirect('/booking')
    
    #좌석 확인
    checked_seats = area.get('seats')
    seats = [int(seat) for seat in seats]
    if (seats == None):
        session['message'] = "잘못된 seats"
        return redirect('/booking')
    if (checked_seats == None):
        session['message'] = "잘못된 checked_seats"
        return redirect('/booking')
    for c in checked_seats:
        if (c['seat_id'] in seats):
            if (CompareTime(c['deadline']) and not c['isBooked']):
                param['message'] = "다른 회원이 예매 중인 좌석입니다."
                return redirect(f'/booking/select_area?event_id={event_id}&area_num={area_num}&message={param["message"]}')
            elif c['isBooked']:
                param['message'] = "예매된 좌석입니다."
                return redirect(f'/booking/select_area?event_id={event_id}&area_num={area_num}&message={param["message"]}')
            
    
    #좌석 예매로 이동 / 예약 마감기한 설정
    now = datetime.now() + timedelta(minutes=3)
    current_app.config['mongo'].events.update_many({"event_id":event_id, f"booking.areas.{area_num}.seats.seat_id":{"$or":seats}},{"$set":{
        f'booking.areas.{area_num}.seats.platform':session.get('platform'),
        f'booking.areas.{area_num}.seats.id':session.get('id'),
        f'booking.areas.{area_num}.seats.deadline': {
            'year': now.year,
            'month': now.month,
            'day': now.day,
            'hour': now.hour,
            'min': now.min
            },
        }})
    param['data']['event'] = event
    session['grap_seats'] = seats
    return render_template('payment_info.html', param=param)
    
@blueprint.route('/select_area')
def select_area():
    param = {
        "message":"",
        "data":{
        }
    }
    event_id = request.values.get('event_id')
    area_num = request.values.get('area_num')
    
    event = current_app.config['mongo'].events.find_one({"event_id":int(event_id)},{"_id":0})
    if (event == None):
        session['message'] = "잘못된 예약"
        return redirect('/booking')
    start_time = event.get('booking')
    if (start_time):
        start_time = start_time.get('areas')
        if (start_time):
            start_time = start_time.get(str(area_num))
    if (start_time == None):
        session['message'] = "예매 가능한 시간이 아닙니다."
        return render_template('select_area.html')
    area = event.get('booking')
    if (area):
        area = area.get('areas')
        if (area):
            area = area.get(str(area_num))
    if (area):
        param['data']['seats'] = json.dumps([seat['seat_id'] for seat in area.get('seats') if (not CompareTime(seat['deadline']) or seat['isBooked'])])
        return render_template('select_seat.html',param=param) #경기 선택 됨
    else:
        session['message'] = "잘못된 구역 선택"
        return render_template('select_area.html', param=param)

@blueprint.route('/select_event', methods=['POST','GET'])
def select_event():
    param = {
        "message":"",
        "data":{
        }
    }
    event_id = request.values.get('event_id')
    event = current_app.config['mongo'].events.find_one({"event_id":int(event_id)},{"_id":0})
    if (event == None):
        session['message'] = "잘못된 event_id를 사용하였습니다."
        return redirect('/booking')
    start_time = event.get('booking')
    if (start_time):
        start_time = start_time.get('areas')
        if (start_time):
            start_time = start_time.get('1')
    if (start_time):
        session['event_id'] = event_id
        event_data = {}
        event_data = event['booking']['areas']
        for i in range(1,4):
            event_data[f"{i}"]["occupancy"] = len([seat['seat_id'] for seat in event_data[f"{i}"].get('seats') if (not CompareTime(seat['deadline']) or seat['isBooked'])])
            del event_data[f"{i}"]['seats']
        param['data']['event'] = json.dumps(event_data, ensure_ascii=False)
        param["data"]['team'] = event['info']['team1']
        return render_template('select_area.html',param=param) #경기 선택 됨
    else:
        session['message'] = "예매 가능한 시간이 아닙니다."
        return redirect('/booking')

@blueprint.route('/payment')
def payment_info():
    param = {
        "message":"",
        "data":{}
    }
        
    area_num = session.get('area_num')
    event_id = session.get('event_id')
    grap_seats = session.get('grap_seats')
    
    #조회 성공 유무
    event = current_app.config['mongo'].events.find_one({"event_id":session.get('event_id')})
    if (not area_num or not event_id or not grap_seats):
        session['message'] = "세션이 만료되었습니다."
        return redirect('/booking')
    param['data']['event'] = event
    return render_template('payment_fin.html', param=param)