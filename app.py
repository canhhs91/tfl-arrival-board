from flask import Flask, render_template, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import requests

app = Flask(__name__)

sullivan_stop_K = '490003753W'

# Initialize an empty list to store the arrivals
sorted_arrivals = []


def update_arrivals():
    global sorted_arrivals
    try:
        arrivals = requests.get(
            f'https://api.tfl.gov.uk/StopPoint/{sullivan_stop_K}/Arrivals').json()
        for i, arrival in enumerate(arrivals):
            # Convert to minutes
            if arrival['timeToStation'] < 30:
                arrivals[i]['timeToStationMins'] = 'due'
            elif arrival['timeToStation'] < 60:
                arrivals[i]['timeToStationMins'] = '1 min'
            else:
                arrival['timeToStationMins'] = f"{arrival['timeToStation'] // 60} mins"

        sorted_arrivals = sorted(
            arrivals, key=lambda arrival: arrival['timeToStation'], reverse=False)
    except Exception as e:
        print(f"Error fetching arrivals: {e}")


scheduler = BackgroundScheduler()
scheduler.add_job(update_arrivals, 'interval', seconds=5)
scheduler.start()


@app.route('/')
def index():
    update_arrivals()
    return render_template('index.html')


@app.route('/get_arrivals')
def get_arrivals():
    return jsonify(arrivals=sorted_arrivals)


if __name__ == '__main__':
    app.run(debug=True)
