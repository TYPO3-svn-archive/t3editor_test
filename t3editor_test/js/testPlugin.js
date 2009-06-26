/***************************************************************
 * Copyright notice
 *
 * (c) 2008 Stephan Petzl <spetzl@gmx.at> and Christian Kartnig <office@hahnepeter.de> 
 * All rights reserved
 *
 * This script is part of the TYPO3 project. The TYPO3 project is
 * free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * The GNU General Public License can be found at
 * http://www.gnu.org/copyleft/gpl.html.
 * A copy is found in the textfile GPL.txt and important notices to the license
 * from the author is found in LICENSE.txt distributed with these scripts.
 *
 *
 * This script is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

/**
 * @class Test plugin for the t3editor-codecompletion
 * @constructor
 * @return A new DescriptionPlugin instance	
 **/

var TestPlugin = function() {

	var tsRef;
	var pluginMeta;
  var testWrap;
  var outerdiv;
  var mirror;
  var tsRef;
  var parser;
  var testAmount = 1;
  var testsFinished = 0;
  var greenBar;
  var logArea;
  var testCases;
  var xmlDoc;
  var proposals;
  
	this.init = function(pluginContext,plugin) {
		pluginMeta = plugin;
		outerdiv = pluginContext.outerdiv;
		mirror = pluginContext.codeMirror;	
		tsRef = pluginContext.tsRef;
		parser = pluginContext.parser;
		
    testWrap = new Element("div",{"style":"font-size: 18px;"});
    outerdiv.insert({before: testWrap});
    var testButton = new Element("input",{"type":"button"});
    testButton.value = 'RUN!';
    testButton.observe('click',startTests.bind(this));
    var barContainer = new Element("div",{"style":"width: 300px;height:20px; border: 1px solid #666;"});
    greenBar = new Element("div",{"id":"greenBar","style":"width: 1px;height:20px;background-color: #0F0;"});
    barContainer.insert(greenBar);
    logArea = new Element("textarea",{"cols":140,"rows":10});
    
    testWrap.insert(testButton);
    testWrap.insert(barContainer);
    testWrap.insert(logArea);
    loadTestCases(pluginMeta.extpath+"testCases3.xml");
		
	}
	function loadTestCases(url){
    log("loading testcases: "+url);
    if(Prototype.Browser.IE){
      xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.onreadystatechange = testCasesLoaded;
      xmlDoc.load(url);
    }else{
      xmlDoc=document.implementation.createDocument("","",null);
      xmlDoc.load(url);
      xmlDoc.onload = testCasesLoaded;
    }
  }
  function testCasesLoaded(){
    testAmount = xmlDoc.getElementsByTagName('testCase').length;
    log("loaded "+testAmount+" tests");
    log('testplugin initialised: click RUN! to run the tests');
		log('--------------------------');
  }
  function getTestCaseById(id){
    var tests = xmlDoc.getElementsByTagName('testCase');
    for(var i=0;i<testAmount;i++){
      var test = tests[i];
      if(test.attributes['id'].value == id)
        return test;
    }
  }
	function log(text,newline){
    logArea.value = logArea.value + text;
    if(newline != false){
      logArea.value += '\n';
    }
  }
	function updateGreenBar(){
    greenBar.style.width = 300*testsFinished/testAmount+"px";
  }
	
  function checkProposal(testCaseId,referenceValue){
    log('testing '+testCaseId,false);
	  var testCase = getTestCaseById(testCaseId);
    var typoscript = testCase.getElementsByTagName('typoscript')[0].textContent.strip();
    mirror.setCode(typoscript);
    mirror.editor.highlightAtCursor();
	  //wait.delay(2,referenceValue);
	  var lastNode = mirror.editor.container.lastChild;
	  mirror.editor.win.select.setCursorPos(mirror.editor.container, lastNode);
    var currentTsTreeNode = parser.buildTsObjTree(mirror.editor.container.firstChild, lastNode);
		var compResult = new CompletionResult(tsRef,currentTsTreeNode);
	  //console.log(compResult.getFilteredProposals(""));
    proposals = compResult.getFilteredProposals("");
    assertEquals(referenceValue,proposals);
  }
  function wait(referenceValue){
    var lastNode = mirror.editor.container.lastChild;
	  mirror.editor.win.select.setCursorPos(mirror.editor.container, lastNode);
    var currentTsTreeNode = parser.buildTsObjTree(mirror.editor.container.firstChild, lastNode);
		var compResult = new CompletionResult(tsRef,currentTsTreeNode);
	  //console.log(compResult.getFilteredProposals(""));
    proposals = compResult.getFilteredProposals("");
    assertEquals(referenceValue,proposals);
  }
  
  // val1: reference value
  // val2: test value
  function assertEquals(val1,val2){
  
    // if val2 is a proposal array: take the first array element and look at its "word" attribute
    if(typeof(val2)=='object'&&(val2 instanceof Array)){
      if(val2.length>0){
        val2 = val2[0];
        val2 = val2.word;
      }else{
        error("assertEquals failed: no value found in array!");
        return;
      }
    }
    if(val1 == val2){
      success();
    }else{
      error("assertEquals failed: should be: '"+val1+"' is: '"+val2+"'");
    }
  }
  function success(){
    log('...ok');
    testsFinished++;
    updateGreenBar();
  }
  function error(message){
    log('...error: '+message);
  }

  function startTests(){
    
    checkProposal('simpleCopy','value');
    checkProposal('type.TEXT.check','value');
    checkProposal('reference1','value');
    checkProposal('reference2','aaa');
    checkProposal('brackets1','altText');
    /*assertEquals('value',getProposals('type.TEXT.check'));
    assertEquals('value',getProposals('reference1'));
    assertEquals('aaa',getProposals('reference2'));
    assertEquals('aaa',getProposals('brackets1'));*/
    /*
    if(proposals.length > 0){
      var prop = proposals[0];
      assertEquals('value',prop.word);
    }*/
      //evalTest.delay(1);
  }
  
  
  
}
