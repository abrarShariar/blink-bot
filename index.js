const puppeteer = require('puppeteer');

(async () => {

  const makeRandString = (limit) => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(let i = 0;i < limit;i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  const browser = await puppeteer.launch({ args: [ '--proxy-server=socks5://127.0.0.1:9050' ] })
  const page = await browser.newPage();

  //test to see if proxy is working alright
  await page.goto('http://www.dnsleaktest.com/', { waitUntil: 'load' })
  const proxyText = await page.evaluate(() => document.querySelector('.welcome').textContent);
  console.log("Page: ", page.url());
  console.log(proxyText);

  await page.goto('http://passport.yandex.com/registration/mail', { waitUntil: 'load' });
  //fill up form input fields
  const password = makeRandString(10);
  const firstname = makeRandString(5);
  const lastname = makeRandString(5);
  const login = makeRandString(10);
  await page.$eval('#firstname', el => el.value = firstname);
  await page.$eval('#lastname', el => el.value = lastname);
  await page.$eval('#login', el => el.value = login);
  await page.$eval('#password', el => el.value = password);
  await page.$eval('#password_confirm', el => el.value = password);


  // click on no mobile phn and proceed next
  // click on class: 'registration__pseudo-link link_has-no-phone'
  await page.$eval('#hint_answer', el => el.value = 'Snow');


  //log account info
  let input = await page.$('input[name=firstname]');
  let value = await input.getProperty('value');
  console.log("Firstname: ",await value.jsonValue());
})();
