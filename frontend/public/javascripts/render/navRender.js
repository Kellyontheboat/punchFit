let loginModal
let registerModal
let loginBtn
let registerBtn
let signInForm
let passwordInput
let msgSpanLogin
let msgSpanRegister

export async function initializeModals () {
  loginModal = document.getElementById('loginPopup')
  registerModal = document.getElementById('registerPopup')
  loginBtn = document.getElementById('login-popup-btn')
  registerBtn = document.getElementById('register-popup-btn')
  signInForm = document.getElementById('signin-form-login')
  passwordInput = document.getElementById('password')
  msgSpanLogin = document.getElementById('login-msg')
  msgSpanRegister = document.getElementById('register-msg')
}

export async function showLoginModal () {
  // Pre-fill the email input if the user just registered
  const registeredEmail = localStorage.getItem('registeredEmail')
  if (registeredEmail) {
    const emailInput = signInForm.querySelector('input[name="email"]')
    emailInput.value = registeredEmail
    localStorage.removeItem('registeredEmail')
  }
  loginModal.style.display = 'block'
  registerModal.style.display = 'none'
  passwordInput.value = ''
  msgSpanLogin.innerText = ''
  registerBtn.addEventListener('click', function () {
    showRegisterModal()
  })
  closeButtons()
}

export async function showRegisterModal () {
  registerModal.style.display = 'block'
  loginModal.style.display = 'none'
  msgSpanRegister.innerText = ''
  loginBtn.addEventListener('click', function () {
    showLoginModal()
    passwordInput.value = ''
  })
  closeButtons()
}

async function closeButtons () {
  const closeButtons = document.querySelectorAll('.close')
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function (event) {
      loginModal.style.display = 'none'
      registerModal.style.display = 'none'
    })
  })
}

export function navScheduleBtn (isAuthenticated) {
  const navScheduleBtn = document.getElementById('my-schedule-btn')

  navScheduleBtn.addEventListener('click', (event) => {
    if (isAuthenticated) {
      window.location.href = '/schedules'
    } else {
      event.preventDefault()
      showLoginModal()
    }
  })
}

export async function updateLoginButton () {
  const loginButton = document.getElementById('login-register-btn')
  if (loginButton) {
    loginButton.innerText = 'Logout'
    loginButton.id = 'logout-btn'
  }
  const logoutBtn = document.getElementById('logout-btn')
  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault()
    localStorage.removeItem('token')
    hideModals() // Hide any open modals before reloading
    setTimeout(() => location.reload(), 100) // Delay reload to ensure modals are hidden
  })
}

async function hideModals () {
  loginModal.style.display = 'none'
  registerModal.style.display = 'none'
}
