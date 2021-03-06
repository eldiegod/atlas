/* eslint-disable @typescript-eslint/no-var-requires */

const faker = require('faker')
const { saveToFile, randomRange } = require('./utils')

const OUTPUT_FILENAME = 'channels.json'
const CHANNELS_COUNT = 10
let nextChannelId = 0

const generateChannel = () => {
  const handleWordsCount = randomRange(1, 4)
  const descriptionWordsCount = randomRange(0, 30)
  return {
    id: (nextChannelId++).toString(),
    title: faker.lorem.words(handleWordsCount),
    description: faker.lorem.words(descriptionWordsCount),
    follows: faker.random.number(150000),
    createdAt: faker.date.past(10),
  }
}

const main = async () => {
  const channels = Array.from({ length: CHANNELS_COUNT }, generateChannel)
  await saveToFile(channels, OUTPUT_FILENAME)
}

main()
