jQuery(document).ready(function($)
{	
$(".events_date").datepicker({
    dateFormat: 'D, M d, yy',
    showOn: 'button',
    buttonImage: '/assets/icons/event.png',
    buttonImageOnly: true,
    numberOfMonths: 3

    });
});