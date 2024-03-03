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




# Catching 404 and 500 Errors 

@app.errorhandler(404)
def error_404(error):
    return jsonify({'error': 'Not Found: {}'.format(error)}),404

@app.errorhandler(500)
def error_500(error):
    return jsonify({'error': 'Not Found: {}'.format(error)}),500





if __name__ == "__main__ " :
    app.run(debug=True)


