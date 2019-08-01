
var allTrips;
var registeredVehicle = {};

$("form").submit(function (event) {
    registeredVehicle = $(this).serializeArray();
    event.preventDefault();

     $.ajax ({
        type: 'POST',
        url: 'http://localhost:3000/vehicle',
        dataType: 'json',
        data: registeredVehicle
    })
        .done((data) => {
            console.log(data);
        })
        alert('successfully Register');
        return false;

        });


var allRegisteredVehicles = [];

async function getAllVehicles() {
	await fetch('http://localhost:3000/vehicle', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then((data) => {
			return data.json()
		})
		.then((vehicles) => {
			allRegisteredVehicles = vehicles;
			//console.log(allRegisteredVehicles);
			generateVehicleOptions(vehicles);
		})
}

function generateVehicleOptions(vehicles) {
	var vehiclesDropDown = document.getElementById('vehicles');
	var i = 1;
	if (vehicles.length !== 0) {
		vehicles.forEach((vehicle) => {
			vehiclesDropDown.options[i] = new Option(vehicle.name + ' ' + vehicle.number, vehicle.number);
			i++;
		});
	}
}

function chooseVehicle() {
	var selectedVehicleNumber = document.getElementById('vehicles').value;

	getAllTripsOfVehicle(selectedVehicleNumber);

}
function getAllTripsOfVehicle(vehicleNumber) {
	// http://localhost:3000/getLastTrip/:vehicleNumber
	fetch('http://localhost:3000/getTripsForVehicle/' + vehicleNumber, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then((data) => {
			return data.json()
		})
		.then((vehicleTrips) => {

			if (vehicleTrips.length !== 0) {
				var previousKmReading = vehicleTrips[vehicleTrips.length - 1].kms;
				document.getElementById('previousKmReading').innerHTML = previousKmReading;
			} else {
				var vehicleDetail = allRegisteredVehicles.filter((vehicle) => {
				
					return vehicle.number === vehicleNumber;
				});
				//console.log(vehicleDetail);

				var previousKmReading = vehicleDetail[0].kms;
				document.getElementById('previousKmReading').innerHTML = 'KM'+previousKmReading;
			}

			renderTripsTable(vehicleTrips);
		})
}

function renderTripsTable(trips) {
	if (trips.length === 0) {
		document.getElementById('vehicleTrips').innerHTML = '';
		document.getElementById('errorMessasge').innerHTML = 'No Trips Found!!!';
		return;
	} else {
		document.getElementById('errorMessasge').innerHTML = '';
	}

	var registeredVehicle = allRegisteredVehicles.filter((vehicle) => {
		return vehicle.number === trips[0].number;
	});

	 var tripsTableHeading = document.getElementById('vehicleTrips');
	 //`
	// <tr>
	// <th scope="col">S.no</th>
	// <th scope="col">Trip Date</th>
	// <th scope="col">Km Reading</th>
	// <th scope="col">Kms In Trip</th>
	// <th scope="col">Average</th>
	// <th scope="col">Rs/Km</th>
	// <th scope="col">Delete</th>
	// </tr>
	// `
       
	// document.getElementById('vehicleTrips').innerHTML = tripsTableHeading;

	trips.forEach((trip, index, trips) => {
		var previousKmReading = 0;
		var currentKmReading = 0;
		if (index === 0) {
			previousKmReading = registeredVehicle[0].kms;
			currentKmReading = trip.kms;
		} else {
			previousKmReading = trips[index - 1].kms;
			currentKmReading = trip.kms;
		}

		var currentDate = new Date(trip.date);
		var date = currentDate.getDate() + '/' + parseInt(currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();
		var tripHtml = `
		<tr>
			<td>${index}s</td>
			<td>${date}</td>
			<td>${trip.kms}</td>
			<td>${calculateKmsInTrip(currentKmReading, previousKmReading)}</td>
			<td>${calculateAverage(
			calculateKmsInTrip(currentKmReading, previousKmReading),
			trip.totalFuelPrice,
			trip.pricePerLtr
		)}</td>
			<td>
				${calculateRsPerKm(
			calculateKmsInTrip(currentKmReading, previousKmReading),
			trip.totalFuelPrice
		)}
			</td>
			<td> <button class = "deleteTrip" value = "${trip._id}" number="${trip.number}" type="button" >Delete</button></td>
		</tr>
		`;

		document.getElementById('vehicleTrips').innerHTML += tripHtml;
	});
}

function calculateKmsInTrip(currentKmReading, previousKmReading) {
	return (Number(currentKmReading) - Number(previousKmReading)).toFixed(2);
}

function calculateAverage(kmsInTrip, totalFuelPrice, pricePerLtr) {
	return (Number(kmsInTrip) / (Number(totalFuelPrice) / Number(pricePerLtr))).toFixed(2);
}

function calculateRsPerKm(kmsInTrip, totalFuelPrice) {
	return (Number(totalFuelPrice) / Number(kmsInTrip)).toFixed(2);
}

// delete vehicle
$(document).on('click', '.deleteTrip', function (event) {
	var objectId = this.value;
	var vehicleNumber = this.number;
	deleteTrip(objectId)
		.done(function () {
			//console.log("deleted");
			//renderTripsTable(trips);
			getAllTripsOfVehicle(vehicleNumber);
		})
});

function deleteTrip(vehicleId) {
	return $.ajax({
		method: 'DELETE',
		url: 'http://localhost:3000/trip/' + vehicleId
	});
}
