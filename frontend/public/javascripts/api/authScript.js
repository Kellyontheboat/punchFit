import { showLoginModal } from '../render/render.js'
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
