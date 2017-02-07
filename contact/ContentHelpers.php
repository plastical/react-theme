<?php 

// set the default timezone to use. Available since PHP 5.1
date_default_timezone_set('UTC');
 
class ContentHelpers {
		/**
     *  
		 *  Generates a random text for our validate input field
     *
     *  @param datetime $built 
     *  @access public
     *  @return boolean
     */
    function randomText() {
			$alphanum = "abcdefghijkmnpqrstuvwxyz23456789";   		
   		$inc = 1;
   		while ($inc < 5) {
   			$alphanum = $alphanum.'abcdefghijkmnpqrstuvwxyz23456789';
   			$inc++;
   		}  
  		$str = substr(str_shuffle($alphanum), 0, rand(4,24));  // 4 Being the minimum amound of letters returned and 24 being the maximum
   		return strtoupper($str);
	}
		
	 /**
     *  
		 *  Calculates time frame for filling a form
     *
     *  @param datetime $built 
     *  @access public
     *  @return boolean
     */
    function isTimeOut($built)  {
		$size = rand(4,9);
		$earliest = new \DateTime($built);
		$earliest->modify("+$size seconds");
		$latest = new \DateTime($built);
		$latest->modify('+30 minutes');
		$now = new \DateTime();
		//compare if too early
		if($now < $earliest){
			return true;
		}
		// compare if too late
		if($now > $latest) {
			return true;
		}
		return false;        
    }
	
}

