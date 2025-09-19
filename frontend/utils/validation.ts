export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = []
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    errors.push("이메일을 입력해주세요")
  } else if (!emailRegex.test(email)) {
    errors.push("올바른 이메일 형식이 아닙니다")
  }

  return { isValid: errors.length === 0, errors }
}

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = []

  if (!password) {
    errors.push("비밀번호를 입력해주세요")
  } else if (password.length < 2) {
    errors.push("비밀번호는 최소 2자 이상이어야 합니다")
  // } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
  //   errors.push("비밀번호는 영문과 숫자를 포함해야 합니다")
  }

  return { isValid: errors.length === 0, errors }
}

export const validateName = (name: string): ValidationResult => {
  const errors: string[] = []

  if (!name) {
    errors.push("이름을 입력해주세요")
  } else if (name.length < 2) {
    errors.push("이름은 최소 2자 이상이어야 합니다")
  } else if (name.length > 20) {
    errors.push("이름은 20자를 초과할 수 없습니다")
  }

  return { isValid: errors.length === 0, errors }
}

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  const errors: string[] = []

  if (!confirmPassword) {
    errors.push("비밀번호 확인을 입력해주세요")
  } else if (password !== confirmPassword) {
    errors.push("비밀번호가 일치하지 않습니다")
  }

  return { isValid: errors.length === 0, errors }
}
