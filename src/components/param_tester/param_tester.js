
function share(e) {
	e.preventDefault();
	let type = $('#paramType').val();
	let value = $('#paramValue').val();
	
	if (type && value){
		console.log(`Sharing: type: ${type} value: ${value}` );
		FSBL.Clients.LinkerClient.publish({dataType:type,data:value});
	}else {
		console.log(`Not sharing: type: ${type} value: ${value}` );
	}

}

FSBL.addEventListener('onReady', function () {
	$('#paramSet').click(share);
});