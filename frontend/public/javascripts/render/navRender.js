import { removeTestAccountOnline } from '../api/authScript.js'

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
  const navModuleBtn = document.querySelector('.module-link')

  const btns = [navScheduleBtn, navModuleBtn]

  btns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (event) => {
        if (isAuthenticated) {
          window.location.href = '/schedules'
        } else {
          event.preventDefault()
          showLoginModal()
        }
      })
    }
  })
}

export function addListenerIndexLoginBtn () {
  const loginBtn = document.querySelector('.index-login-btn')
  console.log(loginBtn)
  if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    showLoginModal()
    })
  } else {
    console.log('no loginBtn')
  }
}

export async function updateLoginButton (user) {
  const loginButton = document.getElementById('login-register-btn')
  if (loginButton) {
    loginButton.innerText = 'Logout.'
    loginButton.id = 'logout-btn'
  }
  const logoutBtn = document.getElementById('logout-btn')
  logoutBtn.addEventListener('click', async (event) => {
    event.preventDefault()
    await removeTestAccountOnline(user) 
    localStorage.removeItem('token')
    hideModals() // Hide any open modals before reloading
    setTimeout(() => location.reload(), 100) // Delay reload to ensure modals are hidden
  })
}

async function hideModals () {
  loginModal.style.display = 'none'
  registerModal.style.display = 'none'
}

export async function coachNavbar (user) {
  console.log(user)
  try {
    // const response = await fetch('/api/user-role', {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    // })
    const { isCoach } = { isCoach: user.isCoach }
    console.log({ isCoach })
    const homepageContainer = document.querySelector('.homepage-link')
    const roleSpan = document.createElement('span')

    if (!isCoach) {
      const navContainer = document.querySelector('.nav-item-container')

      // module nav link
      const aModuleHref = document.createElement('a')
      aModuleHref.classList.add('module-link')
      aModuleHref.href = '/module?sectionIds=1,2,3,4,5,6,7'

      const moduleSpan = document.createElement('span')
      moduleSpan.id = 'my-module-btn'
      moduleSpan.className = 'nav-item'
      moduleSpan.textContent = ' Module.'

      // PunchIn nav link
      const aCalendarHref = document.createElement('a')
      aCalendarHref.classList.add('module-link')
      aCalendarHref.href = '/training'

      const calendarSpan = document.createElement('span')
      calendarSpan.id = 'my-calendar-btn'
      calendarSpan.className = 'nav-item'
      calendarSpan.textContent = ' PunchIn.'

      // post nav link
      const aPostHref = document.createElement('a')
      aPostHref.classList.add('module-link')
      aPostHref.href = '/posts'

      const postSpan = document.createElement('span')
      postSpan.id = 'my-post-btn'
      postSpan.className = 'nav-item'
      postSpan.textContent = ' Post.'

      aModuleHref.appendChild(moduleSpan)
      aCalendarHref.appendChild(calendarSpan)
      aPostHref.appendChild(postSpan)

      navContainer.appendChild(aCalendarHref)
      navContainer.appendChild(aModuleHref)
      navContainer.appendChild(aPostHref)

      roleSpan.textContent = `| Hi, Student ${user.username}`
      roleSpan.classList.add('role-span')
    } else {
      // if isCoacn change the background color
      document.body.style.backgroundColor = '#808080'
      document.querySelector('.before-consult').style.backgroundColor = '#808080'
      roleSpan.classList.add('role-span')
      roleSpan.textContent = `| Hi, Coach ${user.username}`
    }
    homepageContainer.appendChild(roleSpan)

    console.log({ isCoach })
    return ({ isCoach })
  } catch (error) {
    console.error('Error updating navbar:', error)
  }
}

export function scrollVideoAutoPlay () {
  console.log('scrollVideoAutoPlay')
    const videos = document.querySelectorAll('video');

    const options = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.5 // Trigger when 50% of the video is visible
    };

    const handlePlay = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play();
        } else {
          entry.target.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handlePlay, options);

    videos.forEach(video => {
      observer.observe(video);
    });
}