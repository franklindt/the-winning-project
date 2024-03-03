import json
 
with open("File1.json", "r") as file1:     
    data = json.load(file1)
 

features = data[0]['features']
wanted_list = ['Intersection','Offence_Category']

unique = []

for feature in features:
    attributes = feature['attributes']
    wanted_data = {key: attributes[key] for key in wanted_list}
    
    if wanted_data not in unique:
        unique.append(wanted_data)


for line in unique :
    print(line)        


#with open("File1.json", "w") as file1 :  <- Apply change to Files
        #json.dump(unique, file1)

