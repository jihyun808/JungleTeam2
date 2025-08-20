from flask import render_template, redirect, request, session, Blueprint, current_app, url_for
import requests
from datetime import datetime, timedelta
import json
import os
blueprint = Blueprint('book', __name__, url_prefix='/booking')

def CompareTime(t): #입력값 현재 시간을 지났다면 False 안 지났다면 True = 만료시 False
    input_datetime = datetime(
            t.get("year"),
            t.get("month"),
            t.get("day"),
            t.get("hour"),
            t.get("minute")
    )
    print(t)
    print(datetime.now())
    print(input_datetime < datetime.now())
    return input_datetime < datetime.now()

@blueprint.route('/')
def booking():
    param = {
        "message":"",
        "data":{
        },
        "session": {
            "isLogged":False
        }
    }
    message = session.get('message')
    if (message):
        param['message'] = message
        session.pop('message', None)
    session.pop('event_id', None)
    session.pop('area_num', None)
    if (session.get('id')):
        param['session']['isLogged'] = True
    
    events = []
    for e in current_app.config['mongo'].events.find({}):
        event = e['info']
        event['event_id'] = e['event_id']
        events.append(e['info'])
    param['data']['events'] = json.dumps(events, ensure_ascii=False)
    param['session'] = json.dumps(param['session'],ensure_ascii=False)
    return render_template('booking.html', param=param)

@blueprint.route('/select_seat', methods=['POST','GET'])
def select_seat():
    param = {
        "message":"",
        "data":{
        },
        "session": {
            "isLogged":False
        }
    }
    if (session.get('id')):
        param['session']['isLogged'] = True
    id = session.get('id')
    platform = session.get('platform')
    
    event_id = request.values.get('event_id')
    area_num = request.values.get('area_num')
    seats = [int(seat) for seat in json.loads(request.values.get('selection'))]
    
    #조회 성공 유무
    event = current_app.config['mongo'].events.find_one({"event_id":int(event_id)})
    if (not id or not platform):
        session['message'] = "세션이 만료되었습니다."
        return redirect('/signin')
    if (not area_num or not event_id):
        session['message'] = "경기가 없어요."
        return redirect('/booking')
        
    #예매시간
    start_time = (((event.get('booking') or {}).get('areas') or {}).get('1') or {}).get('booking_start')
    if (not CompareTime(start_time) or CompareTime(event['booking']['deadline'])):
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
     
     
    #좌석 확인 + 좌석 개수 확인
    checked_seats = area.get('seats')
    
    if (seats == None):
        session['message'] = "잘못된 seats"
        return redirect('/booking')
    
    user = current_app.config['mongo'].users.find_one({'platform':platform,'id':id},{"_id":0})
    seat_count = 0
    tickets = user.get('tickets')
    
    if (tickets):
        for s in [len(t['seats']) for t in tickets if (t['event_id'] == int(event_id))]:
            seat_count += s
    if (len(seats) + seat_count > 4):
        message = f"좌석은 최대 4개까지만 예약 할 수 있습니다. 예매된 좌석: {seat_count}"
        return redirect(f'/booking/select_area?event_id={event_id}&area_num={area_num}&message={message}')
    
    
    
    if (checked_seats == None):
        session['message'] = "잘못된 checked_seats"
        return redirect('/booking')
    for c in checked_seats:
        if (c['seat_id'] in seats):
            if (c['id'] != id and not CompareTime(c['deadline']) and not c['isBooked']):
                param['message'] = "다른 회원이 예매 중인 좌석입니다."
                return redirect(f'/booking/select_area?event_id={event_id}&area_num={area_num}&message={param["message"]}')
            elif c['isBooked']:
                param['message'] = "예매된 좌석입니다."
                return redirect(f'/booking/select_area?event_id={event_id}&area_num={area_num}&message={param["message"]}')
    
    #좌석 예매로 이동 / 예약 마감기한 설정
    time = datetime.now() + timedelta(minutes=3)
    time = {
        "year": time.year,
        "month": time.month,
        "day": time.day,
        "hour": time.hour,
        "minute": time.minute
    }
    for seat in seats:
        result = current_app.config['mongo'].events.find_one({'event_id': int(event_id),f'booking.areas.{area_num}.seats.seat_id': seat})
        if result == None:
            current_app.config['mongo'].events.update_one({'event_id': int(event_id)},{"$push":{f'booking.areas.{area_num}.seats':{
                "seat_id": seat,
                "platform": platform,
                "id": id,
                "deadline":time,
                "isBooked":False
                }}})
            
        else:
            current_app.config['mongo'].events.update_one({'event_id': int(event_id)},{"$set":{f'booking.areas.{area_num}.seats.$[seat]':{
                "seat_id": seat,
                "platform":platform,
                "id": id,
                "deadline":time,
                "isBooked":False
                }}},array_filters=[{"seat.seat_id": seat}])
    
    info = event.get('info')
    
    param['data'] = {
        "seats": seats,
        "area_name": area['name'],
        "price": area['price'],
        "event_id": int(event_id),
        "date": info['date'],
        "stadium": info['stadium'],
        "team1": info["team1"],
        "team2": info["team2"]
    }
    param['data']['info'] = json.dumps({
        "event_id": int(event_id),
        "area_num": int(area_num),
        "seats": seats
    });
    param['session'] = json.dumps(param['session'],ensure_ascii=False)
    return render_template('payment_info.html', param=param)
    
@blueprint.route('/select_area')
def select_area():
    param = {
        "message":"",
        "data":{
        },
        "session": {
            "isLogged":False
        }
    }
    if (session.get('id')):
        param['session']['isLogged'] = True
    event_id = request.values.get('event_id')
    area_num = request.values.get('area_num')
    id = session.get('id')
    platform = session.get('platform')
    
    #조회 성공 유무
    event = current_app.config['mongo'].events.find_one({"event_id":int(event_id)},{"_id":0})
    if (not id or not platform):
        session['message'] = "세션이 만료되었습니다."
        return redirect('/signin')
    if (not area_num or not event_id):
        session['message'] = "경기가 없어요."
        return redirect('/booking')
    
    #경기 조건
    if (event == None):
        session['message'] = "잘못된 예매"
        return redirect('/booking')
    
    #예매 시간 조건
    start_time = event.get('booking')
    if (start_time):
        start_time = start_time.get('areas')
        if (start_time):
            start_time = start_time.get(str(area_num))
            if (start_time):
                start_time = start_time.get('booking_start')


    if (not CompareTime(start_time) or CompareTime(event['booking']['deadline'])):
        session['message'] = "예매 가능한 시간이 아닙니다."
        return redirect('/booking')
    
    area = event.get('booking')
    if (area):
        area = area.get('areas')
        if (area):
            area = area.get(str(area_num))
    if (area):
        param['data']['seats'] = json.dumps([seat['seat_id'] for seat in area.get('seats') if ((seat['id'] != id and not CompareTime(seat['deadline'])) or seat['isBooked'])], ensure_ascii=False)
        return render_template('select_seat.html',param=param) #경기 선택 됨
    else:
        session['message'] = "잘못된 구역 선택"
        return render_template('select_area.html', param=param)

@blueprint.route('/select_event', methods=['POST','GET'])
def select_event():
    param = {
        "message":"",
        "data":{
        },
        "session": {
            "isLogged":False
        }
    }
    if (session.get('id')):
        param['session']['isLogged'] = True
    param['session'] = json.dumps(param['session'],ensure_ascii=False)
    event_id = request.values.get('event_id')
    event = current_app.config['mongo'].events.find_one({"event_id":int(event_id)},{"_id":0})
    if (event == None):
        session['message'] = "잘못된 event_id를 사용하였습니다."
        return redirect('/booking')
    print(event)
    start_time = event['booking']['areas']['1']['booking_start']
                
    if (CompareTime(start_time)):
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

@blueprint.route('/payment_fin', methods=['POST'])
def payment_fin():
    param = {
        "message":"",
        "data":{},
        "session": {
            "isLogged":False
        }
    }
    if (session.get('id')):
        param['session']['isLogged'] = True
    event_id = request.values.get('event_id')
    area_num = request.values.get('area_num')
    seats = json.loads(request.values.get('seats'))
    id = session.get('id')
    platform = session.get('platform')
    
    #조회 성공 유무
    event = current_app.config['mongo'].events.find_one({"event_id":int(event_id)})
    if (not id or not platform):
        session['message'] = "세션이 만료되었습니다."
        return redirect('/signin')
    if (not area_num or not event_id):
        session['message'] = "경기가 없어요."
        return redirect('/booking')
        
    #예매시간
    start_time = (((event.get('booking') or {}).get('areas') or {}).get('1') or {}).get('booking_start')
    if (not CompareTime(start_time) or CompareTime(event['booking']['deadline'])):
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
    
    if (seats == None):
        session['message'] = "잘못된 seats"
        return redirect('/booking')
    if (checked_seats == None):
        session['message'] = "잘못된 checked_seats"
        return redirect('/booking')
    for c in checked_seats:
        if (str(c['seat_id']) in seats):
            if (c['id'] != id and CompareTime(c['deadline']) and not c['isBooked']):
                param['message'] = "다른 회원이 예매 중인 좌석입니다."
                return redirect(f'/booking/select_area?event_id={event_id}&area_num={area_num}&message={param["message"]}')
            elif c['isBooked']:
                param['message'] = "예매된 좌석입니다."
                return redirect(f'/booking/select_area?event_id={event_id}&area_num={area_num}&message={param["message"]}')
    
    time = datetime.now()
    time = {
        "year": time.year,
        "month": time.month,
        "day": time.day,
        "hour": time.hour,
        "minute": time.minute
    }
    #좌석 예매
    for seat in seats:
        result = current_app.config['mongo'].events.find_one({'event_id': int(event_id),f'booking.areas.{area_num}.seats.seat_id': seat})
        if result == None:
            current_app.config['mongo'].events.update_one({'event_id': int(event_id)},{"$push":{f'booking.areas.{area_num}.seats':{
                "seat_id": seat,
                "platform": platform,
                "id": id,
                "deadline":time,
                "isBooked":True
                }}})
        else:
            current_app.config['mongo'].events.update_one({'event_id': int(event_id)},{"$set":{f'booking.areas.{area_num}.seats.$[seat].isBooked':True}},array_filters=[{"seat.seat_id": seat}])
    info = event['info']
    tickets = {
        "ticket_id": os.urandom(24).hex(),
        "seats": seats,
        "event_id":int(event_id),
        "area_num":int(area_num),
        "area_name": area['name'],
        "date": info['date'],
        "stadium": info['stadium'],
        "team1": info['team1'],
        "team2": info['team2'],
        "price": area['price']
    }
    param['data'] = tickets
    current_app.config['mongo'].users.update_one({'platform':platform,'id':str(id)},{"$push":{"tickets":tickets}})
    
    param['session'] = json.dumps(param['session'],ensure_ascii=False)
    return render_template('payment_fin.html', param=param)