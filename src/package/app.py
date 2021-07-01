# imports
import csv
from csv import reader
import datetime
from datetime import timedelta, date
from config import *

# init
populationCount = 0
populationData = []
temperatureCount = 0
temperatureData = []
missingData=[]
stations = {}
realDeal = []
startDate = datetime.date(2021, 4, 20)
endDate = datetime.date(2015, 1, 1)
deltaDays = startDate - endDate


# Does this thing work?
print ('Hello World!')
# Cool, continue

# Read population data
with open('data/Population_Data.csv', 'r') as read_obj:
    csvPopulationReader = reader(read_obj)
    for row in csvPopulationReader:
        if populationCount > 0 :
            populationCount += 1
            city = {"city":row[0], "state":row[1], "population":row[2], "longitude":row[3], "latitude":row[4], "station": "", "data": []}
            populationData.append(dict(city))
            temperatureData.append(dict(city))
            #cities[row[0]] = 0
        else :
            # do nothing - its the header
            populationCount += 1


# Add station code if it exists for city in temp + pop data
for it in range(len(temperatureData)) :
    c = temperatureData[it]['city'] # city
    s = temperatureData[it]['state'] #state
    #print(c, s)
    # check if a station code exists
    for itt in range(len(stationCodes)) :
        if stationCodes[itt]['city'] == c and stationCodes[itt]['state'] == s :
            station = stationCodes[itt]['code']
            temperatureData[it]['station'] = station 
            
# Read temperature data
with open('data/Temperature_Data.csv', 'r') as read_obj:
    csvTemperatureReader = reader(read_obj)
    for row in csvTemperatureReader:
        if(temperatureCount > 0) :
            #for r in temperatureData :
            #    if row[0] in r.values() :

            #    else :
            #        temperatureData.append({'city': row[0], 'station_code': row[4], data:{'location_date': row[5], 'temp_mean_c': row[6], 'temp_min_c': row[7], 'temp_max_c': row[8]}})
            
            #temperatureCount += 1
            sc = row[4] # station code
            location = row[0] # city
            for r in temperatureData:
                if sc in r.values() :
                    #if stations[sc] > 0 :
                    temp = {'date':row[5], 'temp_mean_c':row[6], 'temp_min_c':row[7], 'temp_max_c':row[8]}
                    r['data'].append(temp.copy())
                    #else :
                    #    stations[sc] = 1
                    #    r['data'] = [{'date':row[5], 'temp_mean_c':row[6], 'temp_min_c':row[7], 'temp_max_c':row[8]}]
                    
        else :
            # do nothing - header row
            temperatureCount += 1

# Check for cities without any temperature data and delete
# gonna get messy - not gto
deleteIndex = []
for i in range(len(temperatureData)) :
    if not temperatureData[i]['data'] :
        #print("This city has no data: ", temperatureData[i]['city'])
        deleteIndex.append(i)

# flip the delete list to not mess up order when deleting from realDeal
deleteIndex.sort(reverse = True)
#print(deleteIndex)

# delete cities that don't have any temperature data
for j in deleteIndex :
    del temperatureData[j]

#print(populationData)
#print(temperatureData)

# loop through each city and each date to find missing dates
for r in temperatureData:
    print ("\n\nCity: ", r['city'])
    print ("Total days of data needed: ", deltaDays.days+1)
    print ("Total days of data recorded: ", len(r['data']))
    print ("Missing days of temperature data: ", deltaDays.days+1-len(r['data']))
    for i in range(deltaDays.days+1) :
        d = startDate - timedelta(days=i)
        dateCheck = "{}/{}/{}".format(d.month, d.day, d.year)
        #print ("Checking for date ", dateCheck)
        if not any(d['date'] == dateCheck for d in r['data']):
            print ("date not found", dateCheck, "for", r['city'])
            priorDate = d - timedelta(days=1)
            nextDate = d + timedelta(days=1)
            priorMax = float(r['data'][i-1]['temp_max_c'])
            priorMin = float(r['data'][i-1]['temp_min_c'])
            priorMean = float(r['data'][i-1]['temp_mean_c'])
            nextMax = float(r['data'][i]['temp_max_c'])
            nextMin = float(r['data'][i]['temp_min_c'])
            nextMean = float(r['data'][i]['temp_mean_c'])
            temp = {'date':dateCheck, 'temp_mean_c':round(((priorMean+nextMean)/2), 2), 'temp_min_c':round(((priorMin+nextMin)/2), 2), 'temp_max_c':round(((priorMax+nextMax)/2), 2)}
            r['data'].insert(i, temp)
            missingData.append({'date': dateCheck, 'city': r['city'], 'state': r['state'], 'station':r['station'], 'temp_mean_c': r['data'][i]['temp_mean_c'], 'temp_max_c': r['data'][i]['temp_max_c'], 'temp_min_c': r['data'][i]['temp_min_c']})
            #print(r['data'][i-1])
            #print(r['data'][i])
            #print(r['data'][i+1])

# Write missing data to "missing_data.csv"
with open('output/missing_data.csv', 'w', newline='') as csvfile:
    fieldnames = ['date', 'city', 'state', 'station', 'temp_mean_c', 'temp_max_c', 'temp_min_c']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in missingData :
        writer.writerow({
            'date': row['date'],
            'city': row['city'],
            'state': row['state'],
            'station': row['station'],
            'temp_mean_c': row['temp_mean_c'],
            'temp_max_c': row['temp_max_c'],
            'temp_min_c': row['temp_min_c']
        })

# Check to make sure all dates have temp data now
for r in temperatureData:
    print ("\n\nCity: ", r['city'])
    print ("Total days of data needed: ", deltaDays.days+1)
    print ("Total days of data recorded: ", len(r['data']))
    print ("Missing days of temperature data: ", deltaDays.days+1-len(r['data']))

# Write full temp/city data
with open('output/data.csv', 'w', newline='') as csvfile:
    fieldnames = ['date', 'city', 'state', 'station', 'lat', 'long', 'avg', 'max', 'min']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in temperatureData :
        for i in range(deltaDays.days+1) :
            writer.writerow({
                'date': row['data'][i]['date'],
                'city': row['city'],
                'state': row['state'],
                'station': row['station'],
                'lat': row['latitude'],
                'long': row['longitude'],
                'avg': row['data'][i]['temp_mean_c'],
                'max': row['data'][i]['temp_max_c'],
                'min': row['data'][i]['temp_min_c'],
            })

# Population weighted temperature by day
totalPopulation = 0
for row in temperatureData:
    totalPopulation += int(row['population'])

output = []
for i in range(deltaDays.days+1):
    popPerMeanTotal = 0
    popPerMaxTotal = 0
    popPerMinTotal = 0
    for j in range(len(temperatureData)):
        popPer = round(int(temperatureData[j]['population'])/totalPopulation, 2)
        popPerMeanIndiv = round(popPer*float(temperatureData[j]['data'][i]['temp_mean_c']), 2)
        popPerMeanTotal += popPerMeanIndiv
        popPerMaxIndiv = round(popPer*float(temperatureData[j]['data'][i]['temp_max_c']), 2)
        popPerMaxTotal += popPerMaxIndiv
        popPerMinIndiv = round(popPer*float(temperatureData[j]['data'][i]['temp_min_c']), 2)
        popPerMinTotal += popPerMinIndiv
        if(j == len(temperatureData)-1):
            temp = {"date": temperatureData[j]['data'][i]['date'], "mean":round(popPerMeanTotal, 2), "max": round(popPerMaxTotal, 2), "min": round(popPerMinTotal, 2)}
            output.append(temp.copy())

# Write to "weighted_population_data.csv" to be used in front end
with open('output/weighted_population_data.csv', 'w', newline='') as csvfile:
    fieldnames = ['date', 'mean', 'max', 'min']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for row in output :
        writer.writerow({
            'date': row['date'],
            'mean': row['mean'],
            'max': row['max'],
            'min': row['min']
        })

#print(totalPopulation)

# El Fin