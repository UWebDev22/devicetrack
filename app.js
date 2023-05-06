const express = require('express');
const connection = require('./pool')
const app = express();

app.get('/devices', (req, res) => {
    connection.query('SELECT * FROM Device ORDER BY id desc', function (err, rows) {
        if (err) {
            console.log('error', err)
            res.status(404).json(err.message)
        } else {
            console.log(rows)
            res.status(200).json({ status: true, statusCode: 200, users: rows })
        }
    })
});
app.get('/getdevicesdata', (req, res) => {
    connection.query("SELECT Device.*, (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', MedicationPlan.ID,  'MedicineText', MedicationPlan.MedicineText, 'Day', MedicationPlan.Day, 'Time', MedicationPlan.Time)) FROM MedicationPlan WHERE MedicationPlan.DeviceID = Device.id) AS medication,  (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', Gps.ID,  'Latitude', Gps.Latitude, 'Longitude', Gps.Longitude, 'BatteryLevel', Gps.BatteryLevel, 'HeartRate', Gps.HeartRate, 'TimeStamp', Gps.TimeStamp)) FROM Gps WHERE Gps.DeviceID = Device.id) AS gps, (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', Alarm.ID, 'AlarmLevel', Alarm.AlarmLevel,'Status', Alarm.Status,'TimeStamp', Alarm.TimeStamp,'TimeStampSetOff', Alarm.TimeStampSetOff )) FROM Alarm WHERE Alarm.DeviceID = Device.id) AS alarm FROM Device ORDER BY Device.ID DESC", 
    function (err, rows) {
        if (err) {
            console.log('error', err)
            res.status(404).json(err.message)
        } else {
            rows.forEach(row => {
                if (row.medication) {
                  row.medication = JSON.parse(row.medication);
                }
                if (row.gps) {
                    row.gps = JSON.parse(row.gps);
                }
                if (row.alarm) {
                    row.alarm = JSON.parse(row.alarm);
                }
              });
            console.log(rows)
            res.status(200).json({ status: true, statusCode: 200, users: rows })
        }
    })
});
// define a route for handling POST requests
app.post('/api/addMedicationPlan', (req, res) => {
    console.log('req....',req)
    console.log('headers....',req.headers)
    // retrieve the data from the request body
    const Time = req.headers.time;
    const Day = req.headers.day;
    const MedicineText = req.headers.medicinetext;
    const DeviceID = req.headers.deviceid;
    console.log('headers....',Time,Day,MedicineText,DeviceID)
    // create a MySQL query to insert the data into the MedicationPlan table
    const query = `INSERT INTO MedicationPlan ( Time, Day, MedicineText, DeviceID) VALUES ('${Time}', '${Day}', '${MedicineText}', '${DeviceID}')`;
  
    // execute the query
    connection.query(query, (err, result) => {
      if (err) throw err;
  
      // send a response to the client
      res.json({ message: 'Medication plan created successfully' });
    });
  });
  app.put('/api/updateMedicationPlan/:id', (req, res) => {
    // retrieve the data from the request body
    const Time = req.headers.time;
    const Day = req.headers.day;
    const MedicineText = req.headers.medicinetext;
    const DeviceID = req.headers.deviceid;

    const ID = req.params.id;
  
    // create a MySQL query to update the row with the given ID
    const query = `UPDATE MedicationPlan SET Time = '${Time}', Day = '${Day}', MedicineText = '${MedicineText}', DeviceID = '${DeviceID}' WHERE ID = ${ID}`;
  
    // execute the query
    connection.query(query, (err, result) => {
      if (err) throw err;
  
      // send a response to the client
      res.json({ message: 'Medication plan updated successfully' });
    });
  });

  app.delete('/api/deleteMedicationPlan/:id', (req, res) => {
    // retrieve the ID of the row to be deleted from the URL parameter
    const ID = req.params.id;
  
    // create a MySQL query to delete the row with the given ID
    const query = `DELETE FROM MedicationPlan WHERE ID = ${ID}`;
  
    // execute the query
    connection.query(query, (err, result) => {
      if (err) throw err;
  
      // send a response to the client
      res.json({ message: 'Medication plan deleted successfully' });
    });
  });

  const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('Server started on port',PORT);
});