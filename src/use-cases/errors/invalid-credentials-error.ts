export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email already exists.')
  }
}
