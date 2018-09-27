
var my = {};

my.CONNECT_TIMEOUT = 3000;

my.sensortag = {};

// UUIDs for MOVEMENT
my.sensortag.MOVEMENT_SERVICE = 'f000aa80-0451-4000-b000-000000000000';
my.sensortag.MOVEMENT_DATA = 'f000aa81-0451-4000-b000-000000000000';
my.sensortag.MOVEMENT_CONFIG = 'f000aa82-0451-4000-b000-000000000000';
my.sensortag.MOVEMENT_PERIOD = 'f000aa83-0451-4000-b000-000000000000';
my.sensortag.MOVEMENT_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';
// UUIDs for BAROMETER
my.sensortag.BAROMETER_SERVICE = 'f000aa40-0451-4000-b000-000000000000';
my.sensortag.BAROMETER_CONFIG = 'f000aa42-0451-4000-b000-000000000000';
my.sensortag.BAROMETER_DATA = 'f000aa41-0451-4000-b000-000000000000';
my.sensortag.BAROMETER_PERIOD = 'f000aa44-0451-4000-b000-000000000000';
my.sensortag.BAROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';


// two sensortags
my.heart = {};
my.ankle = {};
my.heart.pressure = false;
my.ankle.pressure = false;


//attribute
my.dataPoint = [];
my.dataArray = [];

my.origin = 0;

// my.AHRS = {};
// my.AHRS.q = [1,0,0,0];
// my.AHRS.x = 0;
// my.AHRS.y = 0;
// my.AHRS.z = 0;
// my.AHRS.zv = 0;
// my.AHRS.zp = 0;

my.test = {};
my.test.count2 = 0;
my.test.i1 = 0;
my.test.i2 = 0;

my.test.ori1 = false;
my.test.ori2 = false;

my.test.heartArray = [];
my.test.ankleArray = [];

my.test.sub1 = 0;
my.test.sub2 = 0;

my.test.a = false;
my.test.b = false;

my.test.count = 0;

my.find = {};

my.find.max = -100000;
my.find.min = 100000;

my.test.vz = 0;
my.test.pz = 0;
my.test.countMove = 0;

//Init
my.initialize = function(){
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(my.onDeviceReady) },
		false);
	$(document).ready( function(){
		$(window).resize(my.respondCanvas);
		my.respondCanvas();
	});
};

my.respondCanvas = function()
{
	var canvas = $('canvas');
	var container = $(canvas).parent();
	canvas.attr('width', $(container).width() );
};

my.onDeviceReady = function()
{
	my.showInfo('Please put the two sensor tags at the same altitude and activate tap Start.');
	my.initContent();
};

my.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
};
//Init

//Operation
my.onStartButton = function(){
	console.log("press start");
	my.onStopButton();
	my.startScan();
	my.showInfo('Status: Scanning...');
	my.startConnectTimer();
}

my.onStopButton = function(){
	my.stopConnectTimer();
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	my.closeTwoTags();
	my.initContent();
	my.showInfo('Status: Stopped Scanning.');
}

my.closeTwoTags = function(){
	my.heart.device = false;
	my.ankle.device = false;
}

my.onTestButton = function(){
	my.onStopButton();
	my.testStartScan();
	my.showInfo('Status: Scanning...Please turn on the heart SensorTag First');
	my.startConnectTimer();
}

my.startConnectTimer = function(){
	my.connectTimer = setTimeout(
		function(){
			my.showInfo('Status: Scanning...' +
				'Please turn on the heart SensorTag First.');
		},
		my.CONNECT_TIMEOUT)
}

my.stopConnectTimer = function(){
	clearTimeout(my.connectTimer);
}	


//testStartScan use to test
my.testStartScan = function(){

	evothings.easyble.reportDeviceOnce(true);
	evothings.easyble.startScan(
		function(device){
			if(my.deviceIsSensorTag(device)){
				evothings.easyble.stopScan();
				my.connectToDeviceTest(device);
				my.stopConnectTimer();
			}
		},
		function(errorCode){
			my.showInfo('Error: startScan: ' + errorCode + '.');
		})
}


my.startScan = function(){
	evothings.easyble.reportDeviceOnce(true);
	evothings.easyble.startScan(
		function(device){
			if(my.deviceIsSensorTag(device)){
				if(!(my.heart.device && my.ankle.device)){
					
					if(!my.heart.device){
						my.heart.device = device;
						my.showInfo("Find the heart sensortag!\nPlease turn on the ankle device!");
						my.changeContent("hAdd", device.address);
						my.changeContent("hIC", "No");
					} else if(!my.ankle.device && 
						my.heart.device.address !== device.address){
						my.ankle.device = device;
						my.showInfo("Find the ankle sensortag!");
						my.changeContent("aAdd", device.address);
						my.changeContent("aIC", "No");
					}

				}

				if(my.heart.device && my.ankle.device){
					evothings.easyble.stopScan();
					my.showInfo("Find two sensortag! Connecting...");
					my.connectToDevice(my.heart.device);
					my.connectToDevice(my.ankle.device);
					my.stopConnectTimer();
				}
			}


		},
		function(errorCode){
			my.showInfo('Error: startScan: ' + errorCode + '.');
		})
}

my.initContent = function(){
	my.changeContent("aAdd", "Unknown");
	my.changeContent("aIC", "Unknown");
	// my.changeContent("aS", "Unknown");
	my.changeContent("hAdd", "Unknown");
	my.changeContent("hIC", "Unknown");
	// my.changeContent("hS", "Unknown");

}

my.changeContent = function(id, content){
	// console.log(id);
	var p = document.getElementById(id);
	p.innerHTML = content;
}

my.deviceIsSensorTag = function(device){
	console.log('device name: ' + device.name);
	return (device != null) &&
		(device.name != null) &&
		(device.name.indexOf('Sensor Tag') > -1 ||
			device.name.indexOf('SensorTag') > -1);
}

my.connectToDevice = function(device){
	device.connect(
		function(device){
			my.showInfo("Status: SensorTag " + device.address + " is Connected! ");
			my.readService(device);
			if(device.address === my.heart.device.address){
				my.changeContent("hIC","Yes");
			}
			if(device.address === my.ankle.device.address){
				my.changeContent("aIC","Yes");	
			}
			
		},
		function(errorCode){
			my.showInfo("connectToDevice error: "+ errorCode + "/" + device.address+"\nPlease restart!");
		});
}

my.readService = function(device){
	device.readServices(
		[
		my.sensortag.BAROMETER_SERVICE
		// my.sensortag.MOVEMENT_SERVICE
		],
		my.readingData,
		function(errorCode){
			console.log("Error: Fail to read service: " + errorCode + '.' );
		})
}

my.readingData = function(device){
	my.showInfo('Status: Starting notification...');


	device.writeCharacteristic(
		my.sensortag.BAROMETER_CONFIG,
		new Uint8Array([1]),
		function(){
			console.log("Status: writeCharacteristic ok.");
		},
		function(errorCode){
			console.log("Error: writeCharacteristic: " + errorCode + ".");
		});

	device.writeCharacteristic(
		my.sensortag.BAROMETER_PERIOD,
		new Uint8Array([10]),
		function()
		{
			console.log('Status: writeCharacteristic ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});

	device.writeDescriptor(
		my.sensortag.BAROMETER_DATA,
		my.sensortag.BAROMETER_NOTIFICATION, 
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});

	device.enableNotification(
		my.sensortag.BAROMETER_DATA,
		function(data){
			var dataArray = new Uint8Array(data);
			pressure = my.getPressure(dataArray);
			if( device.address === my.heart.device.address && !my.heart.pressure){
				my.heart.pressure = my.getPressure(dataArray);
				// console.log("A " + my.heart.pressure);
				my.test.heartArray.push(my.heart.pressure);
				my.test.i1++;
				if(my.test.i1%5 === 0){
					// console.log(my.test.heartArray);
					var ave = my.averageArray(my.test.heartArray);
					// for(var x in my.test.heartArray){
					// 	console.log(x);
					// }
					if(!my.test.ori1){
						my.test.ori1 = ave;
					} else{
						my.test.a = my.test.ori1 - ave;
						// console.log("heart" + ave);
						// my.changeContent("hS", my.test.a);
					}
					my.test.heartArray = [];
					// console.log(ave);
				}


			}
			if( device.address === my.ankle.device.address && !my.ankle.pressure){
				my.ankle.pressure = my.getPressure(dataArray);

				my.test.ankleArray.push(my.ankle.pressure);
				my.test.i2++;
				if(my.test.i2%5 === 0){
					var ave = my.averageArray(my.test.ankleArray);
					if(!my.test.ori2){
						my.test.ori2 = ave;
					}else{

						my.test.b = my.test.ori2 - ave;
						// my.changeContent("aS", my.test.b);
						// console.log("ankle" + ave);
					}
					my.test.ankleArray = [];

				}
				// console.log("B " + my.ankle.pressure);
			}
			if(my.ankle.pressure && my.heart.pressure){

				// my.drawDiagram({heartPressure: my.heart.pressure,
				// 	anklePressure: my.ankle.pressure
				// });
				my.initPressure();
			}
			if(my.test.a && my.test.b){
				// console.log(my.test.a - my.test.b);
				var c = my.test.b - my.test.a;
				// var init = my.test.ori2 - my.test.ori1;
				// console.log(init);
				// if(c > 0.025 && c < 0.025){
				// 	console.log("-" + c);
				// 	my.test.count = 0;
				// }else{
				// 	console.log("^" + c);
				// 	my.test.count ++;
				// }
				// if(my.test.count > 10){
				// 	var x = my.test.count - 10;
				// 	console.log( x +"GOOD");
				// }
				if(my.test.count < 20){
					if(c > my.find.max){
						my.find.max = c;
						my.changeContent("t1",c);
					}
					if(c < my.find.min){
						my.find.min = c;
						my.changeContent("t2",c);
					}
					my.showInfo("Initializing...Please don't move the sensor tags");
				}else{
					my.showInfo("The system have been initialized. You can start to use them!");
					if(c > my.find.max -0.03){
						my.test.count2++;
					}else{
						my.test.count2 = 0;
					}
				}

				if(my.test.count2 <= 6){
					my.changeContent("t3","NO");
				}else{
					my.changeContent("t3","YES");
				}
				console.log(c);
				my.initTest();
				my.test.count++;
			}

		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

}

my.averageArray = function(array){
	var y = 0;
	var i = 0;
	for(var x in array){
		// console.log(x);
		y += array[x];
		i++;
	}
	y = y/i;
	// console.log(y);
	return y;
}

my.initTest = function(){
	my.test.a = false;
	my.test.b = false;
}

my.initPressure = function(){
	my.ankle.pressure = false;
	my.heart.pressure = false;
}

my.getPressure = function(dataArray){
	x = dataArray[5] << 16;
	y = dataArray[4] << 8;
	z = dataArray[3];
	return (x + y + z) / 100;
}


my.connectToDeviceTest = function(device){
	device.connect(
		function(device){
			my.showInfo("Status: SensorTag " + device.address + " is Connected! ");
			my.readServiceTest(device);
		},
		function(errorCode){
			my.showInfo("connectToDeviceTest error: "+ errorCode + "/" + device.address);
		});
}

my.readServiceTest = function(device){
	device.readServices(
		[
		my.sensortag.MOVEMENT_SERVICE
		],
		my.readingDataTest,
		function(errorCode){
			console.log("Error: Fail to read service: " + errorCode + '.' );
		})
}

my.readingDataTest = function(device){
	my.showInfo('Status: Starting notification...');

	device.writeCharacteristic(
		my.sensortag.MOVEMENT_CONFIG,
		new Uint8Array([127,0]),
		function(){
			console.log("Status: writeCharacteristic ok.");
		},
		function(errorCode){
			console.log("Error: writeCharacteristic: " + errorCode + ".");
		});

	device.writeCharacteristic(
		my.sensortag.MOVEMENT_PERIOD,
		new Uint8Array([10]),
		function()
		{
			console.log('Status: writeCharacteristic ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});

	device.writeDescriptor(
		my.sensortag.MOVEMENT_DATA,
		my.sensortag.MOVEMENT_NOTIFICATION, 
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});

	device.enableNotification(
		my.sensortag.MOVEMENT_DATA,
		function(data){
			var dataArray = new Uint8Array(data);
			value = my.getAccelerometerValues(dataArray);
			// console.log(dataArray);
			// if(Math.abs(value.a) < 5){
			// 	x = 0;
			// 	console.log("x = 0");
			// }else{
			// 	x = value.a;
			// 	console.log("x = " + x);
			// }
			// my.origin += x * 0.1 ;
			// console.log(my.origin);
			
			// console.log("a = " + value.a + ",b = "+ value.b +",c = "+ value.c);

			// j = Math.sqrt(value.x^2 + value.y^2 + value.z^2);
			x = value.x;
			y = value.y;
			z = value.z;
			// z += 0.05;
			x = x*x;
			y = y*y;
			z = z*z;
			j = x+y+z;

			j = Math.sqrt(j);
			// console.log(j);
			if(j>0.95 && j<1.05){
				// console.log(z);
				my.changeContent("t3","static");
				if(my.test.countMove !== 0){
					dz = my.test.vz;
					my.test.pz -= dz;
					my.test.vz = 0;
					my.test.countMove = 0;
				}

			}else{
				// console.log(z);
				my.changeContent("t3","move");
				az = z*9.81;
				az = az - 9.81;
				my.test.vz += az;
				my.test.pz += my.test.vz * 0.1;
				my.test.countMove ++;
			}
			console.log(my.test.pz);

			
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
}

my.getAccelerometerValues = function(data)
{
	var divisors = { x: 16384.0, y: 16384.0, z: 16384.0 };
	// var divisors = { x: -16384.0, y: 16384.0, z: -16384.0 };
	// Calculate accelerometer values.
	var gx = evothings.util.littleEndianToInt16(data, 0) /(65536 / 500);
	var gy = evothings.util.littleEndianToInt16(data, 2) /(65536 / 500);
	var gz = evothings.util.littleEndianToInt16(data, 4) /(65536 / 500);
	var ax = evothings.util.littleEndianToInt16(data, 6) / divisors.x;
	var ay = evothings.util.littleEndianToInt16(data, 8) / divisors.y;
	var az = evothings.util.littleEndianToInt16(data, 10) / divisors.z;

	return { x: ax, y: ay, z: az , a: gx, b: gy, c: gz};
};

// Initialize the app.
my.initialize();











