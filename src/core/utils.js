function assertExists (item) {
  if (!item) {
    throw new Error('item null or undefined')
  }
}

function getFistItem (response) {
  try {
    const item = response.data.items[0]
    assertExists(item)
    return item
  } catch (err) {
    throw new Error(`No data found, reason: ${err.message}`)
  }
}

function getData (response) {
  try {
    const item = response.data
    assertExists(item)
    return item
  } catch (err) {
    throw new Error(`No data found, reason: ${err.message}`)
  }
}

function getItems (response) {
  try {
    const item = response.data.items
    assertExists(item)
    return item
  } catch (err) {
    throw new Error(`No items found, reason: ${err.message}`)
  }
}

export {
  getData,
  getItems,
  getFistItem
}
