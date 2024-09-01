import { showLoginModal } from '../render/navRender.js'
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
  if (loginBtn) {
    loginBtn.onclick = function () {
      showLoginModal()
    }
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
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          const responseData = await response.json()
          localStorage.setItem('token', responseData.token)
          console.log('Login successfully!')
          window.location.href = '/training'
        } else {
          const errorData = await response.json()
          console.log(errorData)

          if (errorData.message === 'Invalid email or password') {
            msgSpan.innerText = 'Email or Password is wrong'
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
          'Content-Type': 'application/json'
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
