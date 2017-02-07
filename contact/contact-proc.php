<?php 
date_default_timezone_set('UTC');
$path = $_SERVER['DOCUMENT_ROOT'];
include_once $path . '/wp-load.php';
global $wpdb;

include('Html2Text.php');
include('ContentHelpers.php');
include ('class-phpmailer.php');
include ('class-smtp.php');

$host = '';
$username = '';
$password = '';
$from = 'no-reply@agire.ch';
$fromName = 'Fondazione AGIRE';
$to = 'info@plastical.com';
$l = 'en';

$r = array(
	'en' => array(
		'bodyGeneral' => '<br/>Thank you for contacting us.<br/><br/>We will come back to you as soon as possibile.<br/><br/>Best regards.<br/>',
		'subjectInfo' => 'Information request',
		'subjectProject' => 'Project submission',
		'bodyProject' => '<br/>Thank you for submitting a project.<br/><br/>We will evaluate your information and come back to you as soon as possible.<br/><br/>Best regards.<br/>',
	  'subjectAttend' => 'Event attendance',
		'bodyAttend' => '<br/>Thank you for booking a place at this event.<br/><br/>Best regards.<br/>',
	),
	'it' => array(
		'bodyGeneral' => '<br/>Grazie per averci contattato.<br/><br/>Daremo un riscontro non appena possibile.<br/><br/>Cordiali saluti.<br/>',
		'subjectInfo' => 'Richiesta informazioni',
		'subjectProject' => 'Segnalazione di progetto',
		'bodyProject' => '<br/>Grazie per averci segnalato un progetto.<br/><br/>Valuteremo le informazioni fornite e daremo un riscontro non appena possibile.<br/><br/>Cordiali saluti.<br/>',
    'subjectAttend' => 'Iscrizione evento',
		'bodyAttend' => '<br/>Grazie per aver prenotato un posto a questo evento.<br/><br/>Cordiali saluti.<br/>',
  )
);

// verification random string
$contentHelpers = new ContentHelpers();

$errors = array();
$missing = array();
$sqlOK = true;	
		
$jsonItems = Array();
$req= json_decode(file_get_contents('php://input'), true);

// check if the form has been submitted
if (isset($req['submit'])) {	

	// check whether verification is empty
	if (isset($req['verify']) && $req['verify'] != '')
		$errors['verify'] = true;
	
		// check language 
	if (!isset($req['language']))
    	$req['language'] = 'en';
	
	// antispam filter 
	$timeOut = $contentHelpers->isTimeOut($req['built']);
	if ($timeOut == false) {		
			
		$notificationBody = $r[$l]['bodyGeneral'] . $fromName;
		// filter according to reason
		if($req['reason'] == 'info') {
			$expected = array('name', 'email', 'reason', 'details', 'built');
			$required = array('name', 'email', 'reason', 'details', 'built');
			$notificationSubject = $fromName . ': ' . $r[$l]['subjectInfo'];
		}			
		else if($req['reason'] == 'project') {
			$expected = array('name', 'email', 'reason', 'project_name', 'need', 'industry', 'founded', 'funds_raised', 'details', 'url', 'built');
			$required = array('name', 'email', 'reason', 'project_name', 'need', 'industry', 'details', 'built');
			$notificationSubject = $fromName . ': ' . $r[$l]['subjectProject'];
			$notificationBody =  $r[$l]['bodyProject'] . $fromName;
		}
		else if($req['reason'] == 'attendance') {
			$expected = array('ticket_type', 'first_name', 'last_name', 'company', 'email', 'address', 'post_id', 'reason', 'event_name', 'event_startdate', 'built');
			$required = array('ticket_type', 'first_name', 'last_name', 'email', 'address', 'post_id', 'reason', 'event_name', 'event_startdate', 'built');
			$notificationSubject = $fromName . ': ' . $r[$l]['subjectAttend'];
			$notificationBody = $r[$l]['bodyAttend'] . $fromName;
		}
	
		// assume nothing is suspect
		$suspect = false;
		// create a pattern to locate suspect phrases
		$pattern = '/script|Content-Type:|Bcc:|Cc:/i';
		// function to check for suspect phrases
		function isSuspect($val, $pattern, &$suspect) {
			// if the variable is an array, loop through each element
			// and pass it recursively back to the same function
			if (is_array($val)) {
				foreach ($val as $item) {
					isSuspect($item, $pattern, $suspect);
				}
			} else {
				// if one of the suspect phrases is found, set Boolean to true
				if (preg_match($pattern, $val)) {
					$suspect = true;
				}
			}
		}
    isSuspect($req, $pattern, $suspect);    

		if(!$suspect){
			foreach ($req as $key => $value) {
			// assign to temporary variable and strip whitespace if not an array
				$temp = is_array($value) ? $value : trim($value);
				// if empty and required, add to $missing array
				if (empty($temp) && in_array($key, $required)) {
					$missing[] = $key;
				} elseif (in_array($key, $expected)) {
					// otherwise, assign to a variable of the same name as $key
					${$key} = $temp;
				}
			}
		}
		
		// validate the user's email
		if (!$suspect && !empty($email)) {
			if (!filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
				
			} else {
        $errors['email'] = true;
      }
		}
		
		$mailReady = false;
		$message = '';
		// go ahead only if not suspect and all required fields OK
		if (!$suspect && !$missing && !$errors) {
			// initialize the $message variable
			// loop through the $expected array
			foreach($expected as $item) {
				// assign the value of the current item to $val
				if (isset(${$item}) && !empty(${$item})) {
					$val = ${$item};
				} else {
				// if it has no value, assign 'Not selected'
					$val = '-';
				}
				// if an array, expand as comma-separated string
				if (is_array($val)) {
					$val = implode(', ', $val);
				}
				// replace underscores and hyphens in the label with spaces
				$item = str_replace(array('_', '-'), ' ', $item);
				// add label and value to the message body
				if($item != 'verify' && $item != 'built' && $item != 'reason')	{
					if($item == 'details')
						$message .= "<hr/>$val<hr/>";
					else
					$message .= ucfirst($item).": $val<br/>";
				}
			}
			// limit line length to 70 characters
			//$message = wordwrap($message, 70);
			$mailReady = true;
		}

    if ($mailReady && $reason == 'attendance'){
      $name = $first_name . ' ' . $last_name;
      $now = new DateTime();
			$created = $now->format('Y-m-d H:i:s');			
      $sqlOK = false;
      $wpdb->query( $wpdb->prepare(
        'INSERT INTO plst_event_subscriptions 
        ( created, post_id, ticket_type, email, first_name, last_name, company, address ) 
        VALUES ( %s, %d, %s, %s, %s, %s, %s, %s )', 
        $created, $post_id, $ticket_type, $email, $first_name, $last_name, $company, $address
      ) );
      $OK = $wpdb->insert_id;
      if($OK == 0) 
        $sqlOK = false;
      else
        $sqlOK = true;
    }

		if($mailReady && $sqlOK)	{
			
			$mail=new PHPMailer();
			
			// Let PHPMailer use remote SMTP Server to send Email
			$mail->IsSMTP();
			
			// Set the charactor set. The default is 'UTF-8'
			$mail->CharSet='UTF-8';
			
			// Add recipients. You can add more recipients
			// by using this method repeatedly.
			//$mail->AddAddress('xxxxxxx@gmail.com');
			$mail->AddAddress($email);
			$mail->AddBCC($to);
			
			// Set the body of the Email.
			//'Ex.: $message= This Email is sent by PHPMailer of WordPress';
			$mailBody2Text = new Html2Text($message . '<br/><br/>' . $notificationBody);
			$message = $mailBody2Text->get_text();
			
			$mail->Body=$message;
			
			// Set "From" segment of header.
			// For 163.com Email service, it must be the same
			// with your account.
			$mail->From=$from;
			
			// Set addresser's name
			$mail->FromName=$from;
			
			// Set the title
      if($reason == 'attendance') {
        $notificationSubject = $notificationSubject . ' - ' . $event_name . ' (' . $event_startdate . ')';
      }

      $mail->Subject= $notificationSubject;

			// Set the SMTP server.
			$mail->Host=$host;
			
			// Set "need authentication".
			$mail->SMTPAuth=true;
			
			// Set your username and password.
			$mail->Username=$username;
			$mail->Password=$password;
			
			
			// Send Email.
			$mail->Send();
			$jsonItems['result'] = 'ok';
			$jsonItems['name'] = htmlentities($name, ENT_COMPAT, 'UTF-8');
			echo json_encode($jsonItems);
		} else {
			$errors['mailfail'] = true;
      $jsonItems['errors'] = $errors;
			$jsonItems['result'] = 'ko';
			echo json_encode($jsonItems);
		}
	} else {
		$erros['mailfail'] = true;
    $jsonItems['errors'] = $errors;
		$jsonItems['result'] = 'ko';
		echo json_encode($jsonItems);
	}
}
?>
