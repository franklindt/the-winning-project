import json
import requests
from selenium import webdriver


#F1

with open("File1.json", "r") as file1:
    data = json.load(file1)

features = data[0]['features']
wanted_list = ['Neighbourhood', 'Offence_Summary']

unique = []

for feature in features:
    attributes = feature['attributes']
    wanted_data = {key: attributes[key] for key in wanted_list}
    
    if wanted_data not in unique:
        unique.append(wanted_data)

#for line in unique :
    #print(f"{line}\n")

 
 

#F2
    
link = "https://experience.arcgis.com/experience/0bd1487a428b44c5ae29915cdca28685/page/Page/?views=Query"
response = requests.get(link)

status = "Good" if response.status_code == 200 else "Problem with link 'Shooting' "

if status == "Good" :

     




"""import json
import re
from selenium import webdriver 
import requests 
from sys import exit
import pandas as pd


#F1
with open("File1.json", "r") as file1 : 
    cont = file1.read()


data = json.loads(cont)
data = data[0]
data = data['features']

wanted_list = ['Neighbourhood', 'Offence_Summary']

# actual format : data[0]['attributes']

for i in range(len(data)) : # removing the "geometry" key
    data[i] = data[i]["attributes"]
    i+= 1
 

# actual format : data[0]['Neighbourhood'] 
 
for i in range(len(data)) :
    data[i] = {key : data[i][key] for key in  wanted_list}
    i+= 1

format = json.dumps(data)

loaded = json.loads(format)

unique = []

for line in loaded :
    if not line in unique :
        unique.append(line)"""