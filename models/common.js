function withCode(schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
      ret.id = ret.code
      delete ret.code
      delete ret._id
      delete ret.__v
      delete ret.password
      return ret
    },
  })
}

module.exports = { withCode }
