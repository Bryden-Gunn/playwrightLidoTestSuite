import { test, expect } from '@playwright/test'

test.beforeEach('Login', async ({ page }) => {
  await page.goto('https://sheets.lido.app/login')
  await page
    .locator('[data-test-id="SignInEmail"]')
    .fill('bryden.gunn+lidoTest2@gmail.com')
  await page.locator('[data-test-id="SignInPassword"]').fill('LidoTest2')
  await page.getByRole('button', { name: 'Log in with email' }).click()
  //Wait for Files to load
  await page.waitForSelector('//*[contains(@class, "FileName")]')
})

test('Create and delete a file', async ({ page }) => {
  //Get number of files before
  const beforeCount = await page
    .locator('//*[contains(@class, "FileName")]')
    .count()

  // Generate random file name
  const fileName = 'TestFile: ' + Math.floor(Math.random() * 10000)

  // Create new file
  await page.getByText('New file').click()
  await page.locator('//*[contains(@class, "FileTitle")]').first().click()
  await page
    .locator('div')
    .filter({ hasText: /^untitled$/ })
    .getByRole('textbox')
    .fill(fileName)
  await page
    .locator('div')
    .filter({ hasText: fileName })
    .getByRole('textbox')
    .first()
    .press('Enter')

  //Go back to home page
  await page.goto('https://sheets.lido.app/')

  //Wait for Files to load
  await page.waitForSelector('//*[contains(@class, "FileName")]')

  // Assert there is now one more file than before and that new file is visible
  await expect(page.locator('//*[contains(@class, "FileName")]')).toHaveCount(
    beforeCount + 1
  )
  await expect(page.getByText(fileName)).toBeVisible()

  //Delete new file
  await page
    .locator('//*[contains(text(),"' + fileName + '")]/../..')
    .getByRole('button')
    .click()
  await page.getByRole('menu').getByText('Delete').click()
  await page.getByText("Yes, I'm sure").click()

  //Assert the new file has been deleted and the number of files is the same
  await expect(page.getByText(fileName)).not.toBeVisible()
  await expect(page.locator('//*[contains(@class, "FileName")]')).toHaveCount(
    beforeCount
  )
})

test('Names are in Alphabetical order descending', async ({ page }) => {
  //Sort files Alphabetically Descending
  await page.getByText('File name').click()
  await page.getByText('File name').click()

  //Get number of files
  const count = await page.locator('//*[contains(@class, "FileName")]').count()

  //Get File names
  const fileNames = []
  for (let i = 0; i < count; i++) {
    const fileName = await page
      .locator('//*[contains(@class, "FileName")]')
      .nth(i)
      .textContent()
    fileNames.push(fileName)
  }

  // Duplicate fileNames Array
  const unsortedFilenames = fileNames

  // Sort Filenames Alphabetically Descending
  const sortedFileNames = fileNames.sort().reverse()

  //Assert they match
  expect(unsortedFilenames).toEqual(sortedFileNames)
})

test('Dates are in Chronological order descending', async ({ page }) => {
  await page.getByText('Last updated').click()

  //Get number of files
  const count = await page.locator('//*[contains(@class, "FileName")]').count()

  //Get Last Updated Dates
  var dates = []
  for (let i = 0; i < count; i++) {
    const date = await page
      .locator('//*[contains(@class, "LastUpdatedDate")]')
      .nth(i)
      .textContent()
    dates.push(date)
  }

  //Convert into date format
  const convertedDates = []

  dates.map((d) => {
    let month = 0
    switch (d.match(/\w{1,3}/g)[0]) {
      case 'Jan':
        month = 0
        break
      case 'Feb':
        month = 1
        break
      case 'Mar':
        month = 2
        break
      case 'Apr':
        month = 3
        break
      case 'May':
        month = 4
        break
      case 'Jun':
        month = 5
        break
      case 'Jul':
        month = 6
        break
      case 'Aug':
        month = 7
        break
      case 'Sep':
        month = 8
        break
      case 'Oct':
        month = 9
        break
      case 'Nov':
        month = 10
        break
      case 'Dec':
        month = 11
        break
      default:
        month = 0
        break
    }
    convertedDates.push(
      new Date(d.match(/\d{4}/g)[0], month, d.match(/\d{1,2}/g)[0])
    )
  })

  //Sort Chronoligically Descending
  const sortedDates = convertedDates.sort(function (a, b) {
    return new Date(a) - new Date(b)
  })

  //Reformat back to string
  const formattedDates = sortedDates.map((d) => {
    return d
      .toDateString()
      .substring(4)
      .replace(/(?<= )0/g, '')
      .replace(/(?<=\d) /g, ', ')
  })

  //Assert that dates on the page are equal to the sorted dates
  await expect(dates).toEqual(formattedDates)
})
