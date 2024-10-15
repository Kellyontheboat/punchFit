import { showLoginModal } from '../render/navRender.js'

const csrfToken = getCookie('XSRF-TOKEN')

export async function checkLoginStatus () {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const response = await fetch('/api/user/auth', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Response status:', response.status, response.statusText)

        throw new Error('Network response was not ok')
      }
      const userData = await response.json()
      console.log('zzzzz', userData)
      return {
        isAuthenticated: true,
        user: userData.data, // id, username, email
        token
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return {
        isAuthenticated: false,
        user: null
      }
    }
  }
  return {
    isAuthenticated: false,
    user: null
  }
}

export function loginBtn () {
  const loginBtn = document.getElementById('login-register-btn')
  const loginBtn2 = document.querySelector('.index-login-btn')
  const loginBtn3 = document.querySelector('.index-coach-login-btn')
  const coachLoginBtn = document.getElementById('coach-login')

  const handleLoginClick = async function () {
    showLoginModal();
    addListenerPublicCoachAccount()
    const testAccounts = await getTestAccount();
    if (testAccounts.length === 0) {
      return
    }
    const testEmail = testAccounts[0].testEmail
    if (this === loginBtn3) {
      document.getElementById('email').value = "coachJenny@gmail.com"
      document.getElementById('password').value = "coachJenny123456"
    } else {
      document.getElementById('email').value = testEmail
      document.getElementById('password').value = testAccounts[0].testPassword
    }
    
    if (this !== loginBtn) {
      coachLoginBtn.style.display = 'none'
    }
  }

  if (loginBtn) {
    loginBtn.onclick = handleLoginClick;
  }

  if (loginBtn2) {
    loginBtn2.onclick = handleLoginClick;
  }

  if (loginBtn3) {
    loginBtn3.onclick = handleLoginClick;
  }
}

// ! Login Form submission
export async function loginformSubmission () {
  const signInForm = document.getElementById('signin-form-login')
  const msgSpan = document.getElementById('login-msg')

  if (signInForm) {
    signInForm.addEventListener('submit', async function (event) {
      event.preventDefault() // Prevent default form submission

      const formData = new FormData(signInForm)
      // data sent to BE
      const data = {
        email: formData.get('email'),
        password: formData.get('password')
      }
      // call BE api to sent data
      try {
        const response = await fetch('/api/user/auth', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          const responseData = await response.json()
          localStorage.setItem('token', responseData.token)
          const isCoach = responseData.isCoach
          if (isCoach) {
            window.location.href = '/consult'
          } else {
            window.location.href = '/training'
          }
        } else {
          const errorData = await response.json()
          console.log(errorData)

          if (errorData.message === 'Invalid email or password') {
            msgSpan.innerText = 'Email or Password is wrong'
            msgSpan.style.color = 'red'
          } else if (errorData.message === 'This account is already online') {
            msgSpan.innerText = 'This account is already online.Try another one or register a new account.'
            msgSpan.style.color = 'red'
          }
        }
      } catch (error) {
        console.error('Error logging in:', error)
        msgSpan.innerText = 'Error!Please try later.'
        msgSpan.style.color = 'red'
      }
    })
  }
}

// ! Register Form submission
// Handle registration form submission
export async function registerformSubmission () {
  const registerForm = document.getElementById('signin-form-register')
  const registerMessage = document.getElementById('register-msg')

  registerForm.addEventListener('submit', async function (event) {
    event.preventDefault()

    const formData = new FormData(registerForm)
    const data = {
      name: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    }

    // Check if all fields are filled
    if (!data.name || !data.email || !data.password) {
      registerMessage.innerText = 'Please fill in al fields.'
      registerMessage.style.color = 'red'
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      registerMessage.innerText = 'Please enter the right email.'
      registerMessage.style.color = 'red'
      return
    }

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      })
      // if BE return ok true
      if (response.ok) {
        registerMessage.innerText = 'Registered successful,please login.'
        registerMessage.style.color = 'rgb(247, 211, 82)'
        // Store the registered email in localstorage
        localStorage.setItem('registeredEmail', data.email)
      } else {
        const errorData = await response.json()
        // key of custom_http_exception_handler: message
        // if email already exist or ...
        if (errorData.message) {
          registerMessage.innerText = errorData.message
          registerMessage.style.color = 'red'
        } else {
          alert(`Error: ${errorData}`)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error!Please try again.')
    }
  })
};

export async function getTestAccount(){
  const response = await fetch('/api/testAccount', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json()
  console.log('getTestAccount data', data)
  return data
}

export async function removeTestAccountOnline(user){
  const token = localStorage.getItem('token')
  console.log('token', token)
  const response = await fetch('/api/testAccount', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({ user })
  })
  const data = await response.json()
  console.log('removeTestAccountOnline data', data)
  return data
}

export function addListenerPublicCoachAccount(){
  const coachLogin = document.querySelector('.public-coach-login')
  coachLogin.addEventListener('click', (event) => {
    console.log('coachLogin')
    document.getElementById('email').value = "coachJenny@gmail.com"
    document.getElementById('password').value = "coachJenny123456"
  })
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}