function withCode(schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
      ret.id = ret.code
      delete ret.code
      delete ret._id
      delete ret.__v
      delete ret.password
      delete ret.verifyToken
      delete ret.verifyExpires
      return ret
    },
  })
}

module.exports = { withCode }
