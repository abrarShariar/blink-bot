const puppeteer = require('puppeteer');
const fs = require('fs');
const CaptchaSolver = require('captcha-solver');
const delay = require('delay');
const Tesseract = require('tesseract.js');
const request = require('request');
const NodeTesseract = require('node-tesseract');


(async () => {

  const makeRandString = (limit) => {
      let text = "";
      const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
      for(let i = 0;i < limit;i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
  }

  const logFormInputValues = async (page) => {
    let input = await page.$('input[name=firstname]');
    let value = await input.getProperty('value');
    fs.writeFileSync('./log', "firstname: " + await value.jsonValue());

    input = await page.$('input[name=lastname]');
    value = await input.getProperty('value');
    fs.appendFileSync('./log', "\r\nlastname: " + await value.jsonValue());

    input = await page.$('input[name=login]');
    value = await input.getProperty('value');
    fs.appendFileSync('./log', "\r\nlogin: " + await value.jsonValue());

    input = await page.$('input[name=password]');
    value = await input.getProperty('value');
    fs.appendFileSync('./log', "\r\npassword: " + await value.jsonValue());

    input = await page.$('input[name=hint_answer]');
    value = await input.getProperty('value');
    fs.appendFileSync('./log', "\r\nhint_answer: " + await value.jsonValue());
  }

  const browser = await puppeteer.launch({ args: [ '--proxy-server=socks5://127.0.0.1:9050' ] })
  const page = await browser.newPage();

  //test to see if proxy is working alright
  await page.goto('http://www.dnsleaktest.com/', { waitUntil: 'load' })
  let testContent = await page.evaluate(() => document.querySelector('.welcome').textContent);
  console.log("Page: ", page.url());
  console.log(testContent);

  await page.goto('http://passport.yandex.com/registration/mail', { waitUntil: 'load', timeout: 0 });
  //fill up form input fields
  let firstnameText = makeRandString(5);
  let lastnameText = makeRandString(5);
  let loginText = makeRandString(10);
  let passwordText = makeRandString(10);

  await page.$eval('#firstname', (el, firstnameText) => {
     el.value = firstnameText;
  }, firstnameText);

  await page.$eval('#lastname', (el, lastnameText) => {
      el.value = lastnameText;
  }, lastnameText);

  await page.$eval('#login', (el, loginText) => {
      el.value = loginText;
  }, loginText);

  await page.$eval('#password', (el, passwordText) => {
      el.value = passwordText;
  }, passwordText);

  await page.$eval('#password_confirm', (el, passwordText) => {
      el.value = passwordText;
  }, passwordText);


  // click on no mobile phn and proceed next
  // click on class: 'registration__pseudo-link link_has-no-phone'
  await page.$eval('.link_has-no-phone', el => el.click());
  await page.$eval('#hint_answer', el => el.value = 'Snow');

  await delay(7000);
  const imgs = await page.$$eval('.captcha__image', imgs => imgs.map(img => img.getAttribute('src')));
  console.log("imgs: ", imgs);
  //save the image
  const filename = 'captcha';
  const writeFileStream = fs.createWriteStream('captcha.tif')
  request(imgs[0]).pipe(writeFileStream).on('close', async () => {
    console.log(imgs[0], 'saved to', filename);
    Tesseract.recognize('captcha.tif')
      .then(function(result) {
        console.log(result);
      })
    // if(err) {
    //     console.error(err);
    // } else {
    //     console.log(text);
    // }
  });


  await logFormInputValues(page);

})();
