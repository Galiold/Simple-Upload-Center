const jwt = require('jsonwebtoken')

const PRIVATEKEY = process.env.PRIVATEKEY ? process.env.PRIVATEKEY : 'ETbrCY|PlBd(ig7'
const PASSWORD = process.env.PASSWORD

exports.passVerified = pass => {
  console.log(pass);
  console.log(PASSWORD);
    if (pass === PASSWORD) {
        return true
    }
    return false
}

exports.signToken = payload => {
  return jwt.sign(payload, PRIVATEKEY)
}

exports.hasAccess = request => {
  const authHeaders = request.session.auth

  if (authHeaders) {
    // const authHeadersDivided = authHeaders.split(' ')
    // const authType = authHeadersDivided[0]
    // const authToken = authHeadersDivided[1]

    // if (authType === 'Bearer') {
      
    // }
    // try {
        const payload = jwt.verify(authHeaders, PRIVATEKEY)
        return {
          payload: payload,
          verify: true
        }
    //   } catch (e) {
    //     console.log('1')
    //     return {
    //       payload: null,
    //       verify: false
    //     }
    //   }
    //    else {
    //   console.log('2')
    //   return {
    //     payload: null,
    //     verify: false
    //   }
    // }
  } else {
    return {
      payload: null,
      verify: false
    }
  }
}