//Documentation: https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web
  var deviceName = 'ECGMonitoringSystem'
  var bleService = 'a1f1e20e-219a-4bab-bbef-191f2e4a3a55'
  var bleCharacteristicheartsignal = '2819a2f3-a0dd-44e4-a9e7-93fc5a238b79'
  var bleCharacteristicbpm = '44f6958f-4ecb-4359-836b-867704461d3b'
  var blecharacteristicbatterylevel = '19c11d71-1f8a-4971-b2ac-9e30a00ed4d1'
  var bluetoothDeviceDetected
  var gattCharacteristic
  var bledata = [];
  var bleprev;
  var value;
  var bpmvalue;
  var bpmvalueold;
  var bpmvalueoldavg;
  var heartsignalvalue;
  var batterylevelvalue;
  var rrpeakintervalvalue;
  var bpmaverage;
  var batterycase;
  var bpmonce = true;


  document.querySelector('#read').addEventListener('click', function() {
    if (isWebBluetoothEnabled()) { read() }
  })

  document.querySelector('#start').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { start() }
  })

  document.querySelector('#stop').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { stop() }
  })

  document.querySelector('#disconnect').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { disconnect() }
  })

  function isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
      console.log('Web Bluetooth API is not available in this browser!')
      return false
    }

    return true
  }

  function getDeviceInfo() {
    let options = {
      optionalServices: [bleService],
      filters: [
        { "name": deviceName }
      ]
    }

    console.log('Requesting any Bluetooth Device...')
    return navigator.bluetooth.requestDevice(options).then(device => {
      bluetoothDeviceDetected = device
    }).catch(error => {
      console.log('Argh! ' + error)
    })
  }

  function read() {
    return (bluetoothDeviceDetected ? Promise.resolve() : getDeviceInfo())
    .then(connectGATT)
    .then(_ => {
      console.log('First BPM is ')
      document.querySelector('#disconnect').disabled = false
      return gattCharacteristic.readValue()
    })
    .catch(error => {
      console.log('Waiting to start reading: ' + error)
    })
  }

  function connectGATT() {
    if (bluetoothDeviceDetected.gatt.connected && gattCharacteristic) {
      return Promise.resolve()
    }

    return bluetoothDeviceDetected.gatt.connect()
    .then(server => {
      console.log('Getting GATT Service...')
      return server.getPrimaryService(bleService)
    })
    .then(service => {
      console.log('Getting GATT Characteristic...')
      return service.getCharacteristic(bleCharacteristicbpm)
    })
    .then(characteristic => {
      gattCharacteristic = characteristic
      gattCharacteristic.addEventListener('characteristicvaluechanged', handleChangedValue)
      document.querySelector('#start').disabled = false
      document.querySelector('#stop').disabled = true
    })
  }

  var i = 0;

  function handleChangedValue(event) {
    value = event.target.value.getUint8(0)
    bledata.push(value)
    if((value == 255) && (bleprev == 255)){
	     bledata.pop();
	     bledata.pop();

       if (bpmonce == true){
         bpmonce = false;
       }

       bpmaverage = bledata.pop();
       var now = new Date()
       console.log('> ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + "bpmaverage=" + bpmaverage);

       rrpeakintervalvalue = bledata.pop();
       console.log ("RR-interval=" + (rrpeakintervalvalue*10));
       //console.log ("HS " + heartsignalvalue);
	     //console.log ("HS " + bledata.pop());  //Heartsignal mapped (0-255)

       batterylevelvalue = bledata.pop();
       console.log("battery= " + batterylevelvalue);
       //console.log ("Battery " + bledata.pop()); //Battery in percent

       bpmvalue = bledata.pop();
       console.log ("BPM= " + bpmvalue);
	     //console.log ("BPM " + bledata.pop() );  //BPM signal
      }

    bleprev=value;

    //console.log('> ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ' BPM is ' + value)
//Write to index

    Batterylevel.innerHTML = batterylevelvalue + '&#x25'
    if (batterylevelvalue >= 80) {
      batterycase=1;
    }
    else if (batterylevelvalue < 80 && batterylevelvalue>=60) {
      batterycase=2;
    }
    else if (batterylevelvalue < 60 && batterylevelvalue>=40) {
      batterycase=3;
    }
    else if (batterylevelvalue < 40 && batterylevelvalue>=20) {
      batterycase=4;
    }
    else if (batterylevelvalue < 20) {
      batterycase=5;
    }

    switch (batterycase) {
      case 1:
        document.getElementById("batterysymbol1").style.visibility = "visible";
        document.getElementById("batterysymbol2").style.visibility = "hidden";
        document.getElementById("batterysymbol3").style.visibility = "hidden";
        document.getElementById("batterysymbol4").style.visibility = "hidden";
        document.getElementById("batterysymbol5").style.visibility = "hidden";

        break;
      case 2:
      document.getElementById("batterysymbol1").style.visibility = "hidden";
      document.getElementById("batterysymbol2").style.visibility = "visible";
      document.getElementById("batterysymbol3").style.visibility = "hidden";
      document.getElementById("batterysymbol4").style.visibility = "hidden";
      document.getElementById("batterysymbol5").style.visibility = "hidden";
        break;
      case 3:
      document.getElementById("batterysymbol1").style.visibility = "hidden";
      document.getElementById("batterysymbol2").style.visibility = "hidden";
      document.getElementById("batterysymbol3").style.visibility = "visible";
      document.getElementById("batterysymbol4").style.visibility = "hidden";
      document.getElementById("batterysymbol5").style.visibility = "hidden";
        break;
      case 4:
      document.getElementById("batterysymbol1").style.visibility = "hidden";
      document.getElementById("batterysymbol2").style.visibility = "hidden";
      document.getElementById("batterysymbol3").style.visibility = "hidden";
      document.getElementById("batterysymbol4").style.visibility = "visible";
      document.getElementById("batterysymbol5").style.visibility = "hidden";
        break;
      case 5:
      document.getElementById("batterysymbol1").style.visibility = "hidden";
      document.getElementById("batterysymbol2").style.visibility = "hidden";
      document.getElementById("batterysymbol3").style.visibility = "hidden";
      document.getElementById("batterysymbol4").style.visibility = "hidden";
      document.getElementById("batterysymbol5").style.visibility = "visible";
        break;

      default:
        console.log ("Batterylevel out of border");
    }


    if ((bpmvalue > 30) && (bpmvalue < 220)) {
      BPMtext.innerHTML = bpmvalue
    }

    if (((rrpeakintervalvalue*10) > 270) && ((rrpeakintervalvalue*10) < 2000)) {
      RRinterval.innerHTML = 'RRinterval:' + (rrpeakintervalvalue*10) + 'ms';
    }

    if ((bpmaverage > 30) && (bpmaverage < 220)) {
      AverageBPM.innerHTML = 'AverageBPM:' + (bpmaverage) + '/min';
    }

    //Data to chart.js
    if ((bpmvalue > 30) && (bpmvalue < 220) && (bpmonce == false)){
      addData(chart,(Math.round(performance.now()/1000)), bpmvalue);
      bpmvalueold = bpmvalue;
      //document.getElementById("giphyheart").style.visibility = "visible";
      //giphyheart.innerHTML = visible
      document.getElementById("giphyheart").style.visibility = "visible";
      setTimeout(function(){ document.getElementById("giphyheart").style.visibility = "hidden"; }, 500);

      //auxiliary variable go in once
      bpmonce = true;

      if (i > 10){
      removeData(chart);
      }
      i++;
    }
  }

  function start() {
    gattCharacteristic.startNotifications()
    .then(_ => {
      console.log('Start reading...')
      document.querySelector('#start').disabled = true
      document.querySelector('#stop').disabled = false
    })

    .catch(error => {
      console.log('[ERROR] Start: ' + error)
    })
  }

  function stop() {
    gattCharacteristic.stopNotifications()
    .then(_ => {
      console.log('Stop reading...')
      document.querySelector('#start').disabled = false
      document.querySelector('#stop').disabled = true
    })
    .catch(error => {
      console.log('[ERROR] Stop: ' + error)
    })
  }

  function disconnect() {
    bluetoothDeviceDetected.gatt.disconnect()
    console.log('Device is disconnected')
    document.querySelector('#disconnect').disabled = true
  }


//chart
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx,
    {
      // The type of chart we want to create
      type: 'bar',

      // The data for our dataset
      data: {
          labels: [] ,

          datasets: [{
              label: 'Heart rate',
              backgroundColor: 'rgb(15, 110, 150)',
              borderColor: 'rgb(15, 110, 150)',
              borderWidth: '2',
              fill: true,
              pointRadius: 1.5,
              data: []
          }]
      },

      // Configuration options go here
      options: {
          layout: {
            padding: {  //https://www.chartjs.org/docs/latest/configuration/layout.html
                left: 50,
                right: 50,
                top: 170,
                bottom: 0,
            }
          },
      responsive: true,
				title: {
					display: true,
					text: 'Heart rate'
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Time in seconds'
						}
					}],
					yAxes: [{
						display: true,
            ticks: {
              max: 140,
               min: 0,
               stepSize: 10
           },
						scaleLabel: {
							display: true,
							labelString: 'Value'
						}
					}]
				}
    }
  });



  function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
  }

  function removeData(chart) {
      chart.data.labels.shift();
      chart.data.datasets.forEach((dataset) => {
          dataset.data.shift();
      });
      chart.update();
  }
