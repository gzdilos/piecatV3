// DOM Ready =============================================================
$(document).ready(function() {
	//hide the elements that should be hidden on start up
	$('#editForm').hide();
	$('#advSearchBar').hide();
	$('#loginForm').hide();
	
    //populate the asset table on initial page load
    populateTable();
	
	//view buttons
	$('#btnEditData').on('click', populateManualData);
	$('#btnViewAll').on('click', viewAll);
	$('#btnViewLogs').on('click', populateHistory);
	
	//pagination buttons
	$('#btnNextPage').on('click', changePage);
	$('#btnPrevPage').on('click', changePage);
	
	//export table button
	$('#btnExportTable').on('click', exportTable);
	
	//EDIT FIELD LINKS
		//edit appname link
		$('#assetList table tbody').on('click', 'td a.linkEditAppName', showEditForm);
	
		//edit owner link
		$('#assetList table tbody').on('click', 'td a.linkEditOwner', showEditForm);
	
		//edit DR link
		$('#assetList table tbody').on('click', 'td a.linkEditDR', showEditForm);
		
		//edit description link
		$('#assetList table tbody').on('click', 'td a.linkEditDescription', showEditForm);

		//edit personal data link
		$('#assetList table tbody').on('click', 'td a.linkEditPersonalData', showEditForm);
	
		//edit sensitive data link
		$('#assetList table tbody').on('click', 'td a.linkEditSensitiveData', showEditForm);
	
		//edit health data link
		$('#assetList table tbody').on('click', 'td a.linkEditHealthData', showEditForm);
		
		//edit rar data link
		$('#assetList table tbody').on('click', 'td a.linkEditRarData', showEditForm);		
		
		//edit restricted data link
		$('#assetList table tbody').on('click', 'td a.linkEditRestrictedData', showEditForm);
		
		//edit public data link
		$('#assetList table tbody').on('click', 'td a.linkEditPublicData', showEditForm);		
		
		//NOTE: need to add an additional event listener for each MANUAL field you would like to add
	//
	
	$('#pageButtons').on('click', 'a.linkPageNumber', changePage);
	
	//edit submit button
	$('#btnEdit').on('click', sendEdit);
	
	//edit cancel button
	$('#btnCancel').on('click', hideEdit);
	
	//add Asset button click
    // $('#btnAddAsset').on('click', addAsset);
	
	//sort button clicks
	$('#appname').on('click', sort);
	$('#owner').on('click', sort);
	$('#instance').on('click', sort);
	$('#hostname').on('click', sort);
	$('#port').on('click', sort);
	$('#environment').on('click', sort);
	$('#DR').on('click', sort);
	$('#OS').on('click', sort);
	$('#description').on('click', sort);
	$('#location').on('click', sort);
	$('#personaldata').on('click', sort);
	$('#sensitivedata').on('click', sort);
	$('#healthdata').on('click', sort);
	$('#rardata').on('click', sort);
	$('#restricteddata').on('click', sort);
	$('#publicdata').on('click', sort);
	
	//NOTE: Add an additional event listener above this comment for each field button you added to views/index.jade
	
	//search bar buttons
	$('#btnSearch').on('click', searchAssets);
	$('#btnShowAdvSearch').on('click', showAdvSearch);
	
	//advanced search options button
	$('#btnCancelAdvSearch').on('click', hideAdvSearch);
	$('#btnAdvSearch').on('click', advSearch);
	
	//login buttons
	$('#btnLogin').on('click', authenticateLogin);
	$('#btnCancelLogin').on('click', hideLogin);	
});
var sortField = "";
// Functions =============================================================

// Fill table with all data
function populateTable() {
	//show the sort and search options
	$('#sortAndSearchOptions').show();

    // Empty content string
    var tableContent = '';
	var headers = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/assets/assetlist', function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data.entries, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.appname + '</td>';
            tableContent += '<td>' + this.owner + '</td>';
            tableContent += '<td>' + this.instance + '</td>';
            tableContent += '<td>' + this.hostname + '</td>';
            tableContent += '<td>' + this.port + '</td>';
            tableContent += '<td>' + this.environment + '</td>';
            tableContent += '<td>' + this.DR + '</td>';
			tableContent += '<td>' + this.OS + '</td>';
			tableContent += '<td>' + this.description + '</td>';
			tableContent += '<td>' + this.location + '</td>';
            tableContent += '<td>' + this.personaldata + '</td>';
            tableContent += '<td>' + this.sensitivedata + '</td>';
            tableContent += '<td>' + this.healthdata + '</td>';
			tableContent += '<td>' + this.rardata + '</td>';
			tableContent += '<td>' + this.restricteddata + '</td>';
			tableContent += '<td>' + this.publicdata + '</td>';
			
			//NOTE: add another tableContent += statement above this comment for each additional field you want to add
            tableContent += '</tr>';
        });

		//use the appropriate headers
		headers += '<th> App Name </th>';
		headers += '<th> Owner </th>';
		headers += '<th> Instance Name </th>';
		headers += '<th> Host Name </th>';
		headers += '<th> Port </th>';
		headers += '<th> Environment </th>';
		headers += '<th> DR </th>';		
		headers += '<th> OS </th>';
		headers += '<th> App Description </th>';
		headers += '<th> Location </th>';
		headers += '<th> Personal Data? </th>';
		headers += '<th> Sensitive Data? </th>';
		headers += '<th> Health Data? </th>';		
		headers += '<th> Regulatory Availability Requirements? </th>';
		headers += '<th> Restricted Data? </th>';
		headers += '<th> Public Information? </th>';
		
		//NOTE: add another headers += statement above this comment for each additional field you want to add
		
        // Inject the whole content string into our existing HTML table
        $('#assetList table tbody').html(tableContent);
		$('#assetList table thead').html(headers);
		
		populatePageInfo(1, data.pages);
    });
	
	//hide the elements that should be hidden on start up
	$('#editForm').hide();
	$('#advSearchBar').hide();
	$('#loginForm').hide();	
	$('#pageButtons').val(1);
};

// Fill table with manual data only
function populateManualData() {
	//hide the sort and search options
	$('#sortAndSearchOptions').hide();

    //empty content and headers string
    var tableContent = '';
	var headers = '';
	//tracks the different apps we have
	var appnames = [];
	
    //jQuery AJAX call for JSON
    $.getJSON( '/assets/manualentries', function( data ) {

        //for each item in our JSON, add a table row and cells to the content string
		//ignore the entry if that appname is already in the table
        $.each(data, function(){
			if ($.inArray(this.appname, appnames) == -1) {
				tableContent += '<tr>';
				tableContent += '<td><a href="appname" class="linkEditAppName" rel="' + this.appname + '" title="Edit App Name">' + this.appname + '</a></td>';
				tableContent += '<td><a href="owner" class="linkEditOwner" rel="' + this.appname + '" title="Edit Owner">' + this.owner + '</a></td>';
				tableContent += '<td><a href="DR" class="linkEditDR" rel="' + this.appname + '" title="Edit DR">' + this.DR + '</a></td>';
				tableContent += '<td><a href="description" class="linkEditDescription" rel="' + this.appname + '" title="Edit Description">' + this.description + '</a></td>';
				tableContent += '<td><a href="personaldata" class="linkEditPersonalData" rel="' + this.appname + '" title="Edit Personal Data">' + this.personaldata + '</a></td>';
				tableContent += '<td><a href="sensitivedata" class="linkEditSensitiveData" rel="' + this.appname + '" title="Edit Sensitive Data">' + this.sensitivedata + '</a></td>';
				tableContent += '<td><a href="healthdata" class="linkEditHealthData" rel="' + this.appname + '" title="Edit Health Data">' + this.healthdata + '</a></td>';
				tableContent += '<td><a href="rardata" class="linkEditRarData" rel="' + this.appname + '" title="Edit Rar Data">' + this.rardata + '</a></td>';
				tableContent += '<td><a href="restricteddata" class="linkEditRestrictedData" rel="' + this.appname + '" title="Edit Restricted Data">' + this.restricteddata + '</a></td>';
				tableContent += '<td><a href="publicdata" class="linkEditPublicData" rel="' + this.appname + '" title="Edit Public Data">' + this.publicdata + '</a></td>';
				
				//NOTE: need to add another "tableContent +=" statement above this comment for each additional MANUAL field you want to add
				
				tableContent += '</tr>';
				appnames.push(this.appname);
			}
        });
		
		//use the appropriate headers
		headers += '<th> App Name </th>';
		headers += '<th> Owner </th>';
		headers += '<th> DR </th>';
		headers += '<th> App Description </th>';
		headers += '<th> Personal Data? </th>';
		headers += '<th> Sensitive Data? </th>';
		headers += '<th> Health Data? </th>';		
		headers += '<th> Regulatory Availability Requirements? </th>';
		headers += '<th> Restricted Data? </th>';
		headers += '<th> Public Information? </th>';
		
		//NOTE: need to add another "headers +=" statement above this comment for each additional MANUAL field you want to add
		
        // Inject the whole content string into our existing HTML table
        $('#assetList table tbody').html(tableContent);
		$('#assetList table thead').html(headers);
		$('#pageButtons').hide();
		
    });
	
	//hide the elements that should be hidden on start up
	$('#editForm').hide();
	$('#advSearchBar').hide();
	$('#loginForm').hide();
};

// Fill table with all log data
function populateHistory() {
	//show the sort and search options
	$('#sortAndSearchOptions').show();

    //empty content string
    var tableContent = '';
	var headers = '';

    //jQuery AJAX call for JSON
    $.getJSON( '/assets/log', function( data ) {
        // //for each item in our JSON, add a table row and cells to the content string
		// //only show manual and log data
        // $.each(data.entries, function(){
            // tableContent += '<tr>';
            // tableContent += '<td>' + this.appname + '</td>';
            // tableContent += '<td>' + this.owner + '</td>';
            // tableContent += '<td>' + this.DR + '</td>';
			// tableContent += '<td>' + this.description + '</td>';
            // tableContent += '<td>' + this.personaldata + '</td>';
            // tableContent += '<td>' + this.sensitivedata + '</td>';
            // tableContent += '<td>' + this.healthdata + '</td>';
			// tableContent += '<td>' + this.rardata + '</td>';
			// tableContent += '<td>' + this.restricteddata + '</td>';
			// tableContent += '<td>' + this.publicdata + '</td>';
			
			// //NOTE: need to add another "tableContent +=" statement above this comment for each MANUAL FIELD you want to add
			// tableContent += '<td>' + this.action + '</td>';
			// tableContent += '<td>' + this.user + '</td>';
			// tableContent += '<td>' + this.date + '</td>';
            // tableContent += '</tr>';
        // });

		// //use the appropriate headers
		// headers += '<th> App Name </th>';
		// headers += '<th> Owner </th>';
		// headers += '<th> DR </th>';	
		// headers += '<th> App Description </th>';	
		// headers += '<th> Personal Data? </th>';
		// headers += '<th> Sensitive Data? </th>';
		// headers += '<th> Health Data? </th>';		
		// headers += '<th> Regulatory Availability Requirements? </th>';
		// headers += '<th> Restricted Data? </th>';
		// headers += '<th> Public Information? </th>';		
		
		// //NOTE: need to add another "headers +=" statement above this comment for each MANUAL FIELD you want to add
		// headers += '<th> Action </th>';	
		// headers += '<th> Edited By </th>';	
		// headers += '<th> Date </th>';	
		tableContent = createTableRows(data.entries);
		headers = createTableHeaders(data.entries);
		
        // Inject the whole content string into our existing HTML table
        $('#assetList table tbody').html(tableContent);
		$('#assetList table thead').html(headers);
		
		populatePageInfo(1, data.pages);
    });
	
	//hide the elements that should be hidden on start up
	$('#editForm').hide();
	$('#advSearchBar').hide();
	$('#loginForm').hide();
};

// Performs search and displays results
function searchAssets(event) {
	/*	
	 *	NOTE: This line is called at the start of most event handlers that would normally take the user to a new page.
	 *	The default action (new page) is prevented if we want to stay on the same page and use AJAX Queries to obtain the data we need form the URL
	 */
	event.preventDefault();
	
	//empty content string
    var tableContent = '';
	var headers = '';
	
    //jQuery AJAX call for JSON
    $.getJSON( '/assets/search/' + $('#searchBar fieldset input#inputSearchText').val(), function( data ) {
	if (data.entries == "") {
		tableContent = "Your search returned no results..."
	}else
	{

		//convert our JSON data into html content for the table
        tableContent = createTableRows(data.entries);

		//create html table headers by looking at the fields in our data
		headers = createTableHeaders(data.entries);	
	}	
		// Inject the whole content string into our existing HTML table
		$('#assetList table tbody').html(tableContent);
		$('#assetList table thead').html(headers);
		
		populatePageInfo(1, data.pages);
		
		//clear the form inputs
		$('#searchBar fieldset input').val('');		
    });
}

// Performs advanced search and displays results
function advSearch(event) {

	event.preventDefault();
	//empty content string
    var tableContent = '';
	var headers = '';
	
	//extract our search strings from each input box
	var appnameVal =  $('#advSearchBar fieldset input#inputSearchAppname').val();
	var ownerVal =  $('#advSearchBar fieldset input#inputSearchOwner').val();
	var instanceVal =  $('#advSearchBar fieldset input#inputSearchInstance').val();
	var hostnameVal =  $('#advSearchBar fieldset input#inputSearchHostname').val();
	var portVal =  $('#advSearchBar fieldset input#inputSearchPort').val();
	var environmentVal =  $('#advSearchBar fieldset input#inputSearchEnvironment').val();
	var DRVal =  $('#advSearchBar fieldset input#inputSearchDR').val();	
	var OSVal =  $('#advSearchBar fieldset input#inputSearchOS').val();	
	var descriptionVal =  $('#advSearchBar fieldset input#inputSearchDescription').val();	
	var locationVal =  $('#advSearchBar fieldset input#inputSearchLocation').val();	
	var personaldataVal =  $('#advSearchBar fieldset input#inputSearchPersonalData').val();
	var sensitivedataVal =  $('#advSearchBar fieldset input#inputSearchSensitiveData').val();
	var healthdataVal =  $('#advSearchBar fieldset input#inputSearchHealthData').val();	
	var rardataVal =  $('#advSearchBar fieldset input#inputSearchRarData').val();	
	var restricteddataVal =  $('#advSearchBar fieldset input#inputSearchRestrictedData').val();	
	var publicdataVal =  $('#advSearchBar fieldset input#inputSearchPublicData').val();	
	
	//NOTE: need to add another variable declaration above this comment for each additional field you want to add

	//construct our query with the values above
	var searchQuery = {};
	if (appnameVal != "") searchQuery['appname'] = appnameVal;
	if (ownerVal != "") searchQuery['owner'] = ownerVal;
	if (instanceVal != "") searchQuery['instance'] = instanceVal;
	if (hostnameVal != "") searchQuery['hostname'] = hostnameVal;
	if (environmentVal != "") searchQuery['environment'] = environmentVal;
	if (DRVal != "") searchQuery['DR'] = DRVal;	
	if (OSVal != "") searchQuery['OS'] = OSVal;	
	if (parseInt(portVal,10)) { // <-- integer value fields have a different format
		searchQuery['port'] = parseInt(portVal,10);
	}
	if (descriptionVal != "") searchQuery['description'] = descriptionVal;	
	if (locationVal != "") searchQuery['location'] = locationVal;	
	if (personaldataVal != "") searchQuery['personaldata'] = personaldataVal;
	if (sensitivedataVal != "") searchQuery['sensitivedata'] = sensitivedataVal;
	if (healthdataVal != "") searchQuery['healthdata'] = healthdataVal;
	if (rardataVal != "") searchQuery['rardata'] = rardataVal;
	if (restricteddataVal != "") searchQuery['restricteddata'] = restricteddataVal;	
	if (publicdataVal != "") searchQuery['publicdata'] = publicdataVal;	
	
	//NOTE: need to add another IF statement above this comment for each additional field you want to add, remember that integer value fields have a different format of statement
	
	//make an AJAX call to post our query, and get the response containing the result of the query
	$.ajax({
        type: 'POST',
        data: searchQuery,
        url: '/assets/advsearch',
        dataType: 'JSON'
    }).done(function( data ) {	
		if (data.entries == "") {
			tableContent = "Your search returned no results..."
		}else
		{

			//convert our JSON data into html content for the table
			tableContent = createTableRows(data.entries);

			//create html table headers by looking at the fields in our data
			headers = createTableHeaders(data.entries);	
		}	
		// Inject the whole content string into our existing HTML table
		$('#assetList table tbody').html(tableContent);
		$('#assetList table thead').html(headers);
		
		populatePageInfo(1, data.pages);

    });	

}

// Brings up the form to allow the user to edit a field
function showEditForm(event) {
	event.preventDefault();
	
	//get the appname of the entry that we stored in the 'rel' attribute of the link
	var appname = $(this).attr('rel');
	
	//change the title of the edit form to reflect the field they are editing
	$('#editTitle').text("Edit " + $(this).attr('href'));
	
	//show the edit form and tag the id of the entry as well as the field name to the div element
	$('#editForm').show();
	
	//display the value of the field that they are editing
	var oldValue = $(this).text();
	$('#inputEditText').val(oldValue);
	
	//store the database id and field name into the data attribute of the form
	$('#editForm').data('appname', appname);
	$('#editForm').data('field', $(this).attr('href'));
	
	//scroll the user's window to the top, so they can see the edit form
	$('html,body').scrollTop(0);
}

// Submits the user's edit to the database and repopulates the table
function sendEdit(event) {
	event.preventDefault();
	
	//get the appname and fieldname from the data attribute of our edit form element, they are separated by a space
	//var dataString = $('#editForm').data('idAndField').split("ENDOFIDSTARTOFFIELD");
	var appname = $('#editForm').data('appname');
	var field = $('#editForm').data('field');
	
	//create a json object which will be used to edit the entry
	var action = {};
	action[field] = $('#inputEditText').val()
	
	// Use AJAX to post the object to our edit service
    $.ajax({
		type: 'POST',
		data: {"appname": appname, "action": JSON.stringify(action)},
        url: '/assets/edit',
        dataType: 'JSON'
    }).done(function( response ) {

        //check for successful (blank) response
        if (response.msg === '') {

            //clear the form inputs
            $('#inputEditText fieldset input').val('');

            //update the table
            populateTable();

        } else {

            //if something goes wrong, alert the error message that our service returned, in this case, we need the user to log in
            alert('Error: ' + response.msg);
			$('#loginForm').show();
        }
    });
	
	//hide the edit form again
	hideEdit();
}


// Clears and hides the edit form
function hideEdit(event) {
	$('#inputEditText').val('');
	$('#editForm').hide();
}

// Displays the advanced search fields 
function showAdvSearch(event) {
	event.preventDefault();
	$('#advSearchBar').show();
}

// Hides the advanced search fields
function hideAdvSearch(event) {
	event.preventDefault();
	$('#advSearchBar fieldset input').val('');	
	$('#advSearchBar').hide();
}

// Clears the search bar and repopulates the table
function viewAll(event) {
	event.preventDefault();
	
	//clear the form inputs
    $('#searchBar fieldset input').val('');
	
	//repopulate the table
	populateTable();
}

// Gets asset list from MongoDB and sorts it before injecting data to the HTML file
function sort(event) {
	event.preventDefault();
    //empty content string
    var tableContent = '';
	var headers = '';

    //jQuery AJAX call for JSON, the field that we are sorting by is determined by the id of the button that was clicked
    $.getJSON( '/assets/sort/'+event.target.id, function( data ) {

		//convert our JSON data into html content for the table
        tableContent = createTableRows(data.entries);

		//create html table headers by looking at the fields in our data
		headers = createTableHeaders(data.entries);
		
		// Inject the whole content string into our existing HTML table
		$('#assetList table tbody').html(tableContent);
		$('#assetList table thead').html(headers);
	
		populatePageInfo(1, data.pages);
    });
};

// Adds an asset entry into the database and updates the HTML table
// function addAsset(event) {
    // event.preventDefault();

    // //very basic validation - increase errorCount variable if any fields are blank
    // var errorCount = 0;
    // $('#addAsset input').each(function(index, val) {
        // if($(this).val() === '') { errorCount++; }
    // });

    // //check and make sure errorCount's still at zero
    // if(errorCount === 0) {

        // //if it is, compile all asset info into one object
        // var newEntry = {
			// 'appname': $('#addAsset fieldset input#inputAppName').val(),
			// 'owner': $('#addAsset fieldset input#inputOwner').val(),
			// 'instance': $('#addAsset fieldset input#inputInstanceName').val(),
			// 'hostname': $('#addAsset fieldset input#inputHostName').val(),
			// 'port': $('#addAsset fieldset input#inputPort').val(),
			// 'environment': $('#addAsset fieldset input#inputEnvironment').val(),
			// 'DR' : $('#addAsset fieldset input#inputDR').val() 
        // }

        // //use AJAX to post the object to our addasset service
        // $.ajax({
            // type: 'POST',
            // data: newEntry,
            // url: '/assets/addasset',
            // dataType: 'JSON'
        // }).done(function( response ) {

            // //check for successful (blank) response
            // if (response.msg === '') {

                // //clear the form inputs
                // $('#addAsset fieldset input').val('');

                // //update the table
                // populateTable();

            // }
            // else {

                // //if something goes wrong, alert the error message that our service returned
                // alert('Error: ' + response.msg);

            // }
        // });
    // }
    // else {
        // //if errorCount is more than 0, error out
        // alert('Please fill in all fields');
        // return false;
    // }	
	
// };

// Clears and hides the login form
function hideLogin() {
	$('#loginForm fieldset input').val('');
	$('#loginForm').hide();
}

function populatePageInfo(currPage, lastPage) {
	var pageNum = 1;
	var count = 0;
	var htmlString = '<b>Page: </b>';
	if (currPage < 6) {
		while (pageNum <= lastPage && count < 11) {
			if (pageNum == currPage) {
				htmlString += '<b>' + pageNum + '   </b>';
			}else {
				htmlString += '<a href = "pageLink" class="linkPageNumber" rel="' + pageNum + '" title="Page Link">' + pageNum + '</a> <b>  </b>';
			}	
			pageNum++;
			count++;
		}
	}else {
		pageNum = currPage - 5;
		while (pageNum <= lastPage && count < 11) {
			if (pageNum == currPage) {
				htmlString += '<b>' + pageNum + '   </b>';
			}else {
				htmlString += '<a href = "pageLink" class="linkPageNumber" rel="' + pageNum + '" title="Page Link">' + pageNum + '</a> <b>  </b>';
			}	
			pageNum++;
			count++;
		}		
	}
	if (currPage < lastPage - 5) {
		htmlString += '<b>...  </b> <a href = "pageLink" class="linkPageNumber" rel="' + lastPage + '" title="Page Link">' + lastPage + '</a>';
	}	
	$('#pageButtons').show();
	$('#pageButtons').html(htmlString);
}

// Sends login details to the /assets/setuser page and awaits the result of the authentication
function authenticateLogin() {
	$.ajax({
        type: 'POST',
        data: {"username": $('#loginForm fieldset input#inputUsername').val(),
			   "password": $('#loginForm fieldset input#inputPassword').val()},
        url: '/assets/setuser',
        dataType: 'text'
    }).done(function( response ) {
		alert(response);
		hideLogin();
	});
}

// Exports our current table to a spreadsheet file
function exportTable(event) {
	//event.preventDefault();
	
	//can't trigger a download with javascript, so we add an element into the user's browser which forces a download
	var url = '/assets/export';
	$('body').append("<iframe src='" + url + "' style='display: none;' ></iframe>");
}

// Switches the page of the current table
function changePage(event) {
	event.preventDefault();
	// var currentPage = parseInt($('#pageButtons').val());
	// var direction = parseInt($(this).val());
	// $.getJSON( '/assets/changepage/' + currentPage + '/' + direction, function( data ) {
		// //update our page info text
		// $('#btnPrevPage').show();
		// $('#btnNextPage').show();
		// var pageInfo = 'page ' + (currentPage + direction) + ' of ' + data.pages;
		// $('#paginationInfo').text(pageInfo);
		// if ((currentPage + direction) == data.pages) $('#btnNextPage').hide();
		// if ((currentPage + direction) == 1) $('#btnPrevPage').hide();
		// //convert our JSON data into html content for the table
        // tableContent = createTableRows(data.entries);

		// //create html table headers by looking at the fields in our data
		// headers = createTableHeaders(data.entries);		
		// // Inject the whole content string into our existing HTML table
		// $('#assetList table tbody').html(tableContent);
		// $('#assetList table thead').html(headers);
		// $('#pageButtons').val(currentPage+direction);
	// });
	
	var currentPage = parseInt($('#pageButtons').val());
	var targetPage = $(this).attr('rel');
	$.getJSON( '/assets/changepage/' + targetPage, function( data ) {
        tableContent = createTableRows(data.entries);

		//create html table headers by looking at the fields in our data
		headers = createTableHeaders(data.entries);		
		// Inject the whole content string into our existing HTML table
		$('#assetList table tbody').html(tableContent);
		$('#assetList table thead').html(headers);
		$('#pageButtons').val(targetPage);	
		populatePageInfo(targetPage, data.pages);
	});
}

// Generates the required table row HTML code given our JSON data
function createTableRows(data) {
	var tableContent = '';
    //for each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
        tableContent += '<tr>';
        if (this.appname) tableContent += '<td>' + this.appname + '</td>';
        if (this.owner) tableContent += '<td>' + this.owner + '</td>';
        if (this.instance) tableContent += '<td>' + this.instance + '</td>';
        if (this.hostname) tableContent += '<td>' + this.hostname + '</td>';
        if (this.port) tableContent += '<td>' + this.port + '</td>';
        if (this.environment) tableContent += '<td>' + this.environment + '</td>';
        if (this.DR) tableContent += '<td>' + this.DR + '</td>';
		if (this.OS) tableContent += '<td>' + this.OS + '</td>';
		if (this.description) tableContent += '<td>' + this.description + '</td>';
		if (this.location) tableContent += '<td>' + this.location + '</td>';
        if (this.personaldata) tableContent += '<td>' + this.personaldata + '</td>';
        if (this.sensitivedata) tableContent += '<td>' + this.sensitivedata + '</td>';
        if (this.healthdata) tableContent += '<td>' + this.healthdata + '</td>';
		if (this.rardata) tableContent += '<td>' + this.rardata + '</td>';
		if (this.restricteddata) tableContent += '<td>' + this.restricteddata + '</td>';
		if (this.publicdata) tableContent += '<td>' + this.publicdata + '</td>';		
		if (this.action) tableContent += '<td>' + this.action + '</td>';
		if (this.user) tableContent += '<td>' + this.user + '</td>';
		if (this.date) tableContent += '<td>' + this.date + '</td>';
		
		//NOTE: need to add another IF statement above this comment for each additional field you want to add
        tableContent += '</tr>';
    });
	
	return tableContent;
}

// Generates the required table header HTML code given our JSON data
function createTableHeaders(data) {
	var headers = '';
	
	//use the appropriate headers (check the first entry to see which ones to use)
	if (data[0].appname) headers += '<th> App Name </th>';
	if (data[0].owner) headers += '<th> Owner </th>';
	if (data[0].instance) headers += '<th> Instance Name </th>';
	if (data[0].hostname) headers += '<th> Host Name </th>';
	if (data[0].port) headers += '<th> Port </th>';
	if (data[0].environment) headers += '<th> Environment </th>';
	if (data[0].DR) headers += '<th> DR </th>';
	if (data[0].OS) headers += '<th> OS </th>';
	if (data[0].description) headers += '<th> App Description </th>';
	if (data[0].location) headers += '<th> Location </th>';
	if (data[0].personaldata) headers += '<th> Personal Data? </th>';
	if (data[0].sensitivedata) headers += '<th> Sensitive Data? </th>';
	if (data[0].healthdata) headers += '<th> Health Data? </th>';		
	if (data[0].rardata) headers += '<th> Regulatory Availability Requirements? </th>';
	if (data[0].restricteddata) headers += '<th> Restricted Data? </th>';
	if (data[0].publicdata) headers += '<th> Public Information? </th>';

	//NOTE: need to add another IF statement ABOVE this comment for each additional field you want to add, these should be in the same order as createTableRows()
	if (data[0].action) headers += '<th> Action </th>';
	if (data[0].user) headers += '<th> Edited By </th>';
	if (data[0].date) headers += '<th> Date </th>';
	return headers;
}

var downloadURL = function downloadURL(url) {
    var hiddenIFrameID = 'hiddenDownloader',
        iframe = $(document).getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = $(document).createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        $(document).body.appendChild(iframe);
    }
    iframe.src = url;
};