const validateNbr = nbr => /^([\d]+-){2,}[\d]+$/.test(nbr)

const apiError = new Error('Something went wrong. Check your internet.')
apiError.code = 'apiError'

const inputError = new Error('Number formatting seems incorrect')
inputError.code = 'inputError'

let failNext = true

export function save(nbr) {
  return new Promise((resolve, reject) => {
    if (!validateNbr(nbr)) {
      return reject(inputError)
    }
    setTimeout(() => {
      const shouldFail = failNext
      failNext = !failNext
      if (shouldFail) {
        reject(apiError)
      } else {
        resolve()
      }
    }, 3000)
  })
}
