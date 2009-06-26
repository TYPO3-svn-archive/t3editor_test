<?php
$GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['t3editor']['plugins'][] = array(
    "classname" => "TestPlugin",
    "classpath" => "js/testPlugin.js",
    "extpath" => "../../../../".t3lib_extMgm::siteRelPath($_EXTKEY),
);

?>
