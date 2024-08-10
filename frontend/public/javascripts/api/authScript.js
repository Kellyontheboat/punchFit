export async function checkLoginStatus () {
  const token = localStorage.getItem('token')
  console.log('localStorage token', token)
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
        user: userData.data // id, username, email
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

async function showLoginModal () {
  // LoginModal
  const loginModal = document.getElementById('loginModal')
  const registerModal = document.getElementById('registerModal')
  // const loginBtn = document.getElementById('login-modal-btn');
  // const registerBtn = document.getElementById('register-modal-btn');
  const signInForm = document.getElementById('signin-form-login')
  const passwordInput = document.getElementById('password')
  const msgSpanLogin = document.getElementById('login-msg')
  // const msgSpanRegister = document.getElementById('register-msg');

  const registeredEmail = localStorage.getItem('registeredEmail')
  // Pre-fill the email input if the user just registered
  if (registeredEmail) {
    const emailInput = signInForm.querySelector('input[name="email"]')
    emailInput.value = registeredEmail
    localStorage.removeItem('registeredEmail')
  }
  console.log(loginModal)
  loginModal.style.display = 'block'
  // registerModal.style.display = 'none'
  passwordInput.value = ''
  msgSpanLogin.innerText = ''
  // registerBtn.addEventListener('click', function () {
  //   showRegisterModal();
  // });
  closeButtons()
}

// Close modal when clicking on the close button
async function closeButtons () {
  const closeButtons = document.querySelectorAll('.close')
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function (event) {
      console.log(event.target)
      loginModal.style.display = 'none'
      // registerModal.style.display = 'none'
    })
  })
}

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
          console.log('login successfully!')
          location.reload()
        } else {
          const errorData = await response.json()
          console.log(errorData)

          if (errorData.message === 'Incorrect email or password') {
            msgSpan.innerText = '電子郵件或密碼錯誤'
            msgSpan.style.color = 'red'
          }
        }
      } catch (error) {
        console.error('Error logging in:', error)
        msgSpan.innerText = '發生錯誤，請稍後再試'
        msgSpan.style.color = 'red'
      }
    })
  }
}
