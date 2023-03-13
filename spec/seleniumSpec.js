import { Builder, By } from 'selenium-webdriver'

describe('client', function () {
  describe('contact', function () {
    const baseUrl = 'http://localhost:5163/contact'
    let driver

    beforeEach(async function () {
      driver = await new Builder().forBrowser('firefox').build()
      await driver.get(baseUrl)
    })

    afterEach(async function () {
      await driver.quit()
    })

    it('should contain a first name', async function () {
      const details = await driver.findElement(By.id('firstName'))
      expect(details).toBeDefined()
    })

    it('should contain a last name', async function () {
      const details = await driver.findElement(By.id('lastName'))
      expect(details).toBeDefined()
    })

    it('should contain an email', async function () {
      const details = await driver.findElement(By.id('email'))
      expect(details).toBeDefined()
    })

    it('should contain a subject', async function () {
      const details = await driver.findElement(By.id('subject'))
      expect(details).toBeDefined()
    })

    it('should contain a message', async function () {
      const details = await driver.findElement(By.id('message'))
      expect(details).toBeDefined()
    })

    it('should submit contact form successfully', async function () {
      await driver.findElement(By.id('firstName')).sendKeys('John')
      await driver.findElement(By.id('lastName')).sendKeys('Doe')
      await driver.findElement(By.id('email')).sendKeys('example@gmail.com')
      await driver.findElement(By.id('subject')).sendKeys('here is the subject')
      await driver.findElement(By.id('message')).sendKeys('here is the message')
      const details = await driver.findElement(By.id('sendButton'))
      await details.click()
      const actions = driver.actions()
      await actions.pause(2500).perform()
      const isSent = await driver.findElement(By.id('statusMessage')).getText()
      expect(isSent).toBe('Message sent!')
    })
  })
})
