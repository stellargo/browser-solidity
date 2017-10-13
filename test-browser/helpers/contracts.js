'use strict'

module.exports = {
  getCompiledContracts: getCompiledContracts,
  testContracts: testContracts,
  addFile: addFile,
  switchFile: switchFile,
  verifyContract: verifyContract
}

function getCompiledContracts (browser, compiled, callback) {
  browser.execute(function () {
    var contracts = document.querySelectorAll('#compileTabView select option')
    if (!contracts) {
      return null
    } else {
      var ret = []
      for (var c = 0; c < contracts.length; c++) {
        ret.push(contracts[c].innerHTML)
      }
      return ret
    }
  }, [], function (result) {
    callback(result)
  })
}

function verifyContract (browser, compiledContractNames, callback) {
  getCompiledContracts(browser, compiledContractNames, (result) => {
    if (result.value) {
      for (var contract in compiledContractNames) {
        console.log(' - ' + result.value)
        console.log(' - ' + compiledContractNames[contract])
        if (result.value.indexOf(compiledContractNames[contract]) === -1) {
          browser.assert.fail('compiled contract ' + compiledContractNames + ' not found', 'info about error', '')
          browser.end()
          return
        }
      }
    } else {
      browser.assert.fail('compiled contract ' + compiledContractNames + ' not found - none found', 'info about error', '')
      browser.end()
    }
    console.log('contracts all found ' + result.value)
    callback()
  })
}

function testContracts (browser, fileName, contractCode, compiledContractNames, callback) {
  browser
    .click('.compileView')
    .clearValue('#input textarea')
    .perform((client, done) => {
      addFile(browser, fileName, contractCode, done)
    })
    .pause(5000)
    .perform(function () {
      verifyContract(browser, compiledContractNames, callback)
    })
}

function addFile (browser, name, content, done) {
  browser.click('.newFile')
  .perform((client, done) => {
    browser.execute(function (fileName) {
      if (fileName !== 'Untitled.sol') {
        document.querySelector('#modal-dialog #prompt_text').setAttribute('value', fileName)
      }
      document.querySelector('#modal-footer-ok').click()
    }, [name], function (result) {
      console.log(result)
      done()
    })
  })
  .setValue('#input textarea', content, function () {})
  .pause(1000)
  .perform(function () {
    done()
  })
}

function switchFile (browser, name, done) {
  browser
  .useXpath()
  .click('//ul[@id="files"]//span[text()="' + name + '"]')
  .useCss()
  .pause(2000)
  .perform(function () {
    done()
  })
}
