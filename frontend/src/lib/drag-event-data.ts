const getURIsFromDataTransferItem = async (i: DataTransferItem): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    try {
      i.getAsString((list: string) => {
        resolve(list.split('\n'))
      })
    } catch (error) {
      reject(error)
    }
  })

export async function getPlainTextURIsFromDropEventData (data: DataTransfer): Promise<string[]> {
  for (const i of data.items) {
    if (i.type === 'text/plain') {
      return await getURIsFromDataTransferItem(i)
    }
  }

  throw new Error('no URIs item found')
}
