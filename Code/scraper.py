import json
import requests
from bs4 import BeautifulSoup
import re
import collections


 

with open("File1.json", "r") as file1:    #File 1
    data = json.load(file1)

with open("temp.txt", "r") as files2:     #File 2
    data2 = files2.read()


features = data[0]['features']
wanted_list = ['Intersection','Offence_Category']

unique = []
unique2 = []
unique2.append(data2)

for feature in features:
    attributes = feature['attributes']
    wanted_data = {key: attributes[key] for key in wanted_list}
    
    if wanted_data not in unique:
        unique.append(wanted_data)


for line in unique :
    print(line)        

"""""
for i in range(len(unique2)) :
    unique2[i] = {'Neighbourhood' : unique2[i]}
"""
     
  
#for line in unique :
    #print(f"{line}\n")

#with open("File1.json", "w") as file1 : <--- Apply the change and close the file
        #json.dump(unique, file1)

