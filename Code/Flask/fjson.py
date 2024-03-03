from flask import Flask , jsonify
import json



app  = Flask(__name__)
app.config ['DEBUG']=True

@app.route('/')
def hello():
    return "Hello World" 


@app.route('/json')
def get_json():
    with open("Static/File1.json") as file :
        data = json.load(file)
        return jsonify(data)



if __name__ == "__main__ " :
    app.run(debug=True)


