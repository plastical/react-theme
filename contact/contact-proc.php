<?php 
header("Access-Control-Allow-Origin: *");
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
		'bodyGeneral' => '<br/>Thank you for contacting us.<br/><br/>We will come back to you as soon as possible.<br/><br/>Best regards.<br/>',
		'subjectContact' => 'Information request',
    'reasonTecnopolo' => 'Tecnopolo Ticino',
    'reasonTechTransfer' => 'Technology transfer',
    'reasonSupport' => 'Startup / SME support',
    'reasonCoaching' => 'Coaching',
    'reasonOther' => 'Other',
    'industryLifeSciences' =>  'Life sciences',
    'industryDigitalIct' =>  'Digital / ICT',
    'industryHightechIndustrial' =>  'High tech / Industrial',
    'industryCleantechEnergy' =>  'Cleantech / Energy',
    'industryFashion' =>  'Fashion',
    'industryOther' => 'Other',
    'fileAttached' => 'Complementary information in the attached pdf.',
		'subjectAttend' => 'Event attendance',
		'bodyAttend' => '<br/>Thank you for booking a place at this event.<br/><br/>Best regards.<br/>',
	),
	'it' => array(
		'bodyGeneral' => '<br/>Grazie per averci contattato.<br/><br/>Daremo un riscontro non appena possibile.<br/><br/>Cordiali saluti.<br/>',
		'subjectContact' => 'Richiesta informazioni',
    'reasonTecnopolo' => 'Tecnopolo Ticino',
    'reasonTechTransfer' => 'Transfer tecnologico',
    'reasonSupport' => 'Supporto Startup / PMI',
    'reasonCoaching' => 'Coaching',
    'reasonOther' => 'Altro',
    'industryLifeSciences' =>  'Life sciences',
    'industryDigitalIct' =>  'Digital / ICT',
    'industryHightechIndustrial' =>  'High tech / Industrial',
    'industryCleantechEnergy' =>  'Cleantech / Energy',
    'industryFashion' =>  'Fashion',
    'industryOther' => 'Altro',
    'fileAttached' => 'Informazioni complementari nel pdf allegato.',
		'subjectAttend' => 'Iscrizione evento',
		'bodyAttend' => '<br/>Grazie per aver prenotato un posto a questo evento.<br/><br/>Cordiali saluti.<br/>',
  )
);

function randomText() {
  $alphanum = "abcdefghijkmnpqrstuvwxyz123456789";   		
    $inc = 1;
    while ($inc < 5) {
      $alphanum = $alphanum.'abcdefghijkmnpqrstuvwxyz123456789';
      $inc++;
    }  
    $str = substr(str_shuffle($alphanum), 0, rand(4,8));  // 4 Being the minimum amound of letters returned and 24 being the maximum
    return strtolower($str);
}

function upload($file) {
  $allowedMimeTypes = array( 
    'application/pdf'
  );
  $valid = false;
  if($file['size'] > (10485760/5)) { //2 MB (size is also in bytes)
    $valid = false;
  } else {
    $valid = true;
  }
  if (!in_array($file['type'], $allowedMimeTypes)) {
    $valid = false;
  } else {
    $valid = true;
  }
  if ($valid) {
    // $file_name = round(microtime(true)) . '_' . randomText() . '.pdf';
    // if (move_uploaded_file($file['tmp_name'], $_SERVER['DOCUMENT_ROOT'] . '/files/uploads/docs/' . $file_name)) {
      return true;
      //return strtolower(substr($_SERVER["SERVER_PROTOCOL"],0,5))=='https://'?'https://':'http://' . $_SERVER['HTTP_HOST'] . '/files/uploads/docs/' . $file_name;
    // } else {
      // return false;
    // }
  } else {
    return false;
  }
}


// verification random string
$contentHelpers = new ContentHelpers();

$errors = array();
$missing = array();
$file_input = false;
$uploadOk = true;
$sqlOK = true;	
		
$jsonItems = Array();
$req = json_decode(file_get_contents('php://input'), true);
if (!is_array($req)) {
  $req = $_POST;
}

// check if the form has been submitted
if (isset($req['submit'])) {	

  // check file
  if (isset($_FILES['file_input'])) {    
    $uploadOk = upload($_FILES['file_input']);
    if($uploadOk) {

      $new_file_name = round(microtime(true)) . '_' . randomText() . '.pdf';
      $file_input = $_FILES['file_input']['tmp_name'];
      //$file_input = $uploadOk;
    }
  }
		
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
		if ($req['reason'] != 'attendance') {
			$expected = array('name', 'email', 'company', 'industry', 'url', 'reason', 'details', 'built');
			$required = array('name', 'email', 'reason', 'details', 'built');
      if ($req['reason'] == 'tecnopolo') {
        $notificationReason = $r[$l]['reasonTecnopolo'];
      }
      else if ($req['reason'] == 'tech-transfer_startup-support') {
        $notificationReason = $r[$l]['reasonTechTransfer'] . ' - ' . $r[$l]['reasonSupport'];
      }
      else if ($req['reason'] == 'tech-transfer') {
        $notificationReason = $r[$l]['reasonTechTransfer'];
      }
      else if ($req['reason'] == 'startup-sme-support') {
        $notificationReason = $r[$l]['reasonSupport'];
      } 
      else if ($req['reason'] == 'coaching') {
        $notificationReason = $r[$l]['reasonCoaching'];
      }
      else {
        $notificationReason = $r[$l]['reasonOther'];
      }

			$notificationSubject = $fromName . ': ' . $r[$l]['subjectContact'] . ' - ' . $notificationReason;
		}
		else if ($req['reason'] == 'attendance') {
			$expected = array('first_name', 'last_name', 'email', 'job_title', 'company', 'address', 'post_id', 'reason', 'event_name', 'event_startdate', 'built');
			$required = array('first_name', 'last_name', 'email', 'address', 'post_id', 'reason', 'event_name', 'event_startdate', 'built');
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
					else if($item == 'industry') {
           switch ($val) {
            case 'life-sciences':
              $message .= ucfirst($item).': ' . $r[$l]['industryLifeSciences'] . '<br/>';
              break;
            case 'digital-ict':
              $message .= ucfirst($item).': ' . $r[$l]['industryDigitalIct'] . '<br/>';
              break;
            case 'hightech-industrial':
              $message .= ucfirst($item).': ' . $r[$l]['industryHightechIndustrial'] . '<br/>';
              break;
            case 'cleantech-energy':
              $message .= ucfirst($item).': ' . $r[$l]['industryCleantechEnergy'] . '<br/>';
              break;
            case 'fashion':
              $message .= ucfirst($item).': ' . $r[$l]['industryFashion'] . '<br/>';
              break;
            default:
              $message .= ucfirst($item).': ' . $r[$l]['industryOther'] . '<br/>';
           }
          }
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
        ( created, post_id, email, first_name, last_name, job_title, company, address ) 
        VALUES ( %s, %d, %s, %s, %s, %s, %s, %s )', 
        $created, $post_id, $email, $first_name, $last_name, $job_title, $company, $address
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
      //if($file_input) {
        //$message .= '<br/><br/>' . $r[$l]['fileAttached'] . ' ' . $file_input . '<br/>';
      //}
      if($uploadOk) { 
        if($file_input) {
          $message .= '<br/><br/>' . $r[$l]['fileAttached'] . ' <br/>';
        }
        $mail->AddAttachment($file_input, $new_file_name);
      }

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
			//$mail->Host=$host;
			
			// Set "need authentication".
			//$mail->SMTPAuth=true;
			
			// Set your username and password.
			//$mail->Username=$username;
			//$mail->Password=$password;
			
			
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
