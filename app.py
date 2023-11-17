from flask import Flask, render_template, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import requests
from dotenv import load_dotenv
import os
import time

app = Flask(__name__)
load_dotenv()

tfl_app_key = os.getenv('TFL_APP_KEY')

# Initialize an empty list to store the arrivals
sorted_arrivals = [
    {
        "order": 1,
        "stop_id": "490003753W",
        "title": "Sullivan Avenue (Stop K)",
        "arrivals": []
    },
    {
        "order": 2,
        "stop_id": "490003753E",
        "title": "Sullivan Avenue (Stop J)",
        "arrivals": []
    },
    {
        "order": 3,
        "stop_id": "490010220S",
        "title": "Newham Way (Stop C)",
        "arrivals": []
    },
    {
        "order": 4,
        "stop_id": "490009092E",
        "title": "Custom House Station - Lisie Road (Stop E)",
        "arrivals": []
    }
]


def update_arrivals():
    global sorted_arrivals
    for stop_data in sorted_arrivals:
        stop_id = stop_data['stop_id']
        try:
            arrivals = requests.get(
                f'https://api.tfl.gov.uk/StopPoint/{stop_id}/Arrivals?app_key={tfl_app_key}').json()
            print(
                f'https://api.tfl.gov.uk/StopPoint/{stop_id}/Arrivals?app_key={tfl_app_key}')
            for i, arrival in enumerate(arrivals):
                # Convert to minutes
                if arrival['timeToStation'] <= 31:
                    arrivals[i]['timeToStationMins'] = 'due'
                elif arrival['timeToStation'] <= 91:
                    arrivals[i]['timeToStationMins'] = '1 min'
                else:
                    arrival['timeToStationMins'] = f"{round(arrival['timeToStation'] / 60)} mins"

            stop_data["arrivals"] = sorted(
                arrivals, key=lambda arrival: arrival['timeToStation'], reverse=False)

            # sleep for 1 second to avoid rate limiting
            time.sleep(1)
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
    update_arrivals()
    return jsonify(stops=sorted_arrivals)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
